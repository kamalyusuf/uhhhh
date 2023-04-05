import { useRef, useCallback } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { useRoomStore } from "../../store/room";
import { useSocket } from "../../hooks/use-socket";
import { request } from "../../utils/request";
import { detectDevice, Device } from "mediasoup-client";
import { useTransportStore } from "../../store/transport";
import { usePeerStore } from "../../store/peer";
import { useProducerStore } from "../../store/producer";
import { useMicStore } from "../../store/mic";
import { useRoomChatStore } from "../../store/room-chat";

const loaddevice = () => {
  let handlername = detectDevice();

  if (!handlername) handlername = "Chrome74";

  return new Device({ handlerName: handlername });
};

export const useRoom = (room_id: string) => {
  const { socket } = useSocket();
  const device = useRef(loaddevice()).current;
  const router = useRouter();
  const producerstore = useProducerStore();
  const transportstore = useTransportStore();
  const chatstore = useRoomChatStore((state) => ({ reset: state.reset }));
  const roomstore = useRoomStore((state) => ({
    reset: state.reset,
    set: state.set
  }));
  const micstore = useMicStore((state) => ({
    reset: state.reset,
    id: state.id,
    setstream: state.setstream,
    settrack: state.settrack
  }));
  const peerstore = usePeerStore((state) => ({
    reset: state.reset,
    peers: state.peers,
    add: state.add
  }));

  const leave = useCallback(async () => {
    if (!socket) return;

    roomstore.set({ state: "disconnecting" });

    await request({
      socket,
      event: "leave",
      data: {}
    });

    micstore.reset();
    transportstore.reset();
    producerstore.reset();
    peerstore.reset();
    roomstore.reset();
    chatstore.reset();
  }, [socket]);

  const join = useCallback(async () => {
    if (!socket) return;

    roomstore.set({ state: "connecting" });

    if (producerstore.producer) producerstore.reset();

    if (transportstore.send_transport) transportstore.resetsendtransport();

    if (transportstore.receive_transport)
      transportstore.resetreceivetransport();

    try {
      {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: micstore.id ? { deviceId: micstore.id } : true
        });

        const track = stream.getAudioTracks()[0];

        track.enabled = false;

        setTimeout(() => track.stop(), 120000);
      }

      const { rtp_capabilities } = await request({
        socket,
        event: "rtp capabilities",
        data: {
          room_id
        }
      });

      await device.load({ routerRtpCapabilities: rtp_capabilities });

      const { transport_options: sendtransportoptions } = await request({
        socket,
        event: "create transport",
        data: {
          room_id,
          producing: true,
          consuming: false,
          direction: "send"
        }
      });

      const sendtransport = device.createSendTransport({
        id: sendtransportoptions.id,
        iceParameters: sendtransportoptions.ice_parameters,
        iceCandidates: sendtransportoptions.ice_candidates,
        dtlsParameters: {
          ...sendtransportoptions.dtls_parameters,
          role: "auto"
        },
        iceServers: []
      });

      sendtransport.on(
        "connect",
        ({ dtlsParameters: dtls_parameters }, callback, errorback) => {
          request({
            socket,
            event: "connect transport",
            data: {
              room_id,
              transport_id: sendtransport.id,
              dtls_parameters
            }
          })
            .then(callback)
            .catch(errorback);
        }
      );

      sendtransport.on(
        "produce",
        async (
          { kind, rtpParameters: rtp_parameters, appData: app_data },
          callback,
          errorback
        ) => {
          try {
            const { id } = await request({
              socket,
              event: "produce",
              data: {
                room_id,
                transport_id: sendtransport.id,
                kind,
                rtp_parameters,
                app_data: app_data as Record<string, string>
              }
            });

            callback({ id });
          } catch (e) {
            errorback(e as Error);
          }
        }
      );

      transportstore.setsendtransport(sendtransport);

      const { transport_options: receivetransportoptions } = await request({
        socket,
        event: "create transport",
        data: {
          room_id,
          producing: false,
          consuming: true,
          direction: "receive"
        }
      });

      const receivetransport = device.createRecvTransport({
        id: receivetransportoptions.id,
        iceParameters: receivetransportoptions.ice_parameters,
        iceCandidates: receivetransportoptions.ice_candidates,
        dtlsParameters: {
          ...receivetransportoptions.dtls_parameters,
          role: "auto"
        },
        iceServers: []
      });

      transportstore.setreceivetransport(receivetransport);

      receivetransport.on(
        "connect",
        ({ dtlsParameters: dtls_parameters }, callback, errorback) => {
          request({
            socket,
            event: "connect transport",
            data: {
              room_id,
              transport_id: receivetransport.id,
              dtls_parameters
            }
          })
            .then(callback)
            .catch(errorback);
        }
      );

      const { peers } = await request({
        socket,
        event: "join",
        data: {
          room_id,
          rtp_capabilities: device.rtpCapabilities
        }
      });

      for (const peer of peers) peerstore.add(peer);

      if (!device.canProduce("audio")) {
        roomstore.set({
          state: "connected",
          warn_message: "cannot consume your audio due to some unknown error"
        });

        toast.info("connected");

        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: micstore.id ? { deviceId: micstore.id } : true
      });

      const track = stream.getAudioTracks()[0];

      micstore.setstream(stream);
      micstore.settrack(track);

      const producer = await sendtransport.produce({
        track,
        codecOptions: {
          opusStereo: true,
          opusDtx: true
        }
      });

      producer.on("transportclose", () => {
        producerstore.set({ producer: null });
      });

      producer.on("trackended", async () => {
        toast.warn("microphone disconnected");

        await leave();

        router.replace("/rooms");
      });

      producerstore.add(producer);

      roomstore.set({ state: "connected" });
    } catch (e) {
      const error = e as Error;
      console.log("[useRoom.join] error", error);

      micstore.reset();
      transportstore.reset();
      producerstore.reset();
      peerstore.reset();
      chatstore.reset();
      roomstore.set({
        state: "error",
        error_message: error.message,
        active_speakers: {},
        warn_message: ""
      });
    }
  }, [
    room_id,
    socket,
    producerstore.producer,
    transportstore.send_transport,
    transportstore.receive_transport,
    leave
  ]);

  const mute = useCallback(async () => {
    if (!socket) return;

    const producer = producerstore.producer;

    if (!producer) return;

    producer.pause();

    await request({
      socket,
      event: "pause producer",
      data: {
        producer_id: producer.id
      }
    });

    producerstore.setpaused(true);
  }, [producerstore.producer, socket]);

  const unmute = useCallback(async () => {
    if (!socket) return;

    const producer = producerstore.producer;

    if (!producer) return;

    producer.resume();

    await request({
      socket,
      event: "resume producer",
      data: {
        producer_id: producer.id
      }
    });

    producerstore.setpaused(false);
  }, [producerstore.producer, socket]);

  const disable = useCallback(async () => {
    if (!socket) return;

    const producer = producerstore.producer;

    if (!producer) return;

    producer.close();

    await request({
      socket,
      event: "close producer",
      data: {
        producer_id: producer.id
      }
    });

    producerstore.remove();
  }, [producerstore.producer, socket]);

  const togglemute = useCallback(async () => {
    const producer = producerstore.producer;

    if (!producer) return;

    if (producer.paused) await unmute();
    else await mute();
  }, [producerstore.producer]);

  return {
    join,
    leave,
    mute,
    unmute,
    disable,
    togglemute
  };
};
