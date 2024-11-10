import { useRef, useCallback } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { useRoomStore } from "../../store/room";
import { useSocket } from "../socket/socket-provider";
import { request } from "../../utils/request";
import { detectDevice, Device } from "mediasoup-client";
import { useTransportStore } from "../../store/transport";
import { usePeerStore } from "../../store/peer";
import { useProducerStore } from "../../store/producer";
import { useMicStore } from "../../store/mic";
import { reset } from "../../utils/reset";
import { useShallow } from "../../hooks/use-shallow";
import type { EventError } from "types";

export const useRoom = (room_id: string) => {
  const { socket } = useSocket();
  const device = useRef(loaddevice()).current;
  const router = useRouter();
  const producerstore = useProducerStore();
  const transportstore = useTransportStore();
  const setroomstore = useRoomStore((state) => state.set);
  const { micid, ...micstore } = useMicStore(
    useShallow((state) => ({
      micid: state.id,
      reset: state.reset,
      setstream: state.setstream,
      settrack: state.settrack
    }))
  );
  const peerstore = usePeerStore(
    useShallow((state) => ({
      reset: state.reset,
      peers: state.peers,
      add: state.add
    }))
  );

  const leave = useCallback(async () => {
    if (!socket) return;

    setroomstore({ state: "disconnecting" });

    await request({
      socket,
      event: "leave",
      payload: {}
    });

    reset();
  }, [socket]);

  const join = useCallback(async () => {
    if (!socket) return;

    setroomstore({ state: "connecting" });

    if (producerstore.producer) producerstore.reset();

    if (transportstore.send_transport) transportstore.resetsendtransport();

    if (transportstore.receive_transport)
      transportstore.resetreceivetransport();

    try {
      const { rtp_capabilities } = await request({
        socket,
        event: "rtp capabilities",
        payload: {
          room_id
        }
      });

      await device.load({ routerRtpCapabilities: rtp_capabilities });

      {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: micid ? { deviceId: micid } : true
        });

        const track = stream.getAudioTracks()[0]!;

        track.enabled = false;

        setTimeout(() => track.stop(), 120000);
      }

      const { transport_options: sendtransportoptions } = await request({
        socket,
        event: "create transport",
        payload: {
          room_id,
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
            payload: {
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
              payload: {
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
        payload: {
          room_id,
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
            payload: {
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
        payload: {
          room_id,
          rtp_capabilities: device.rtpCapabilities
        }
      });

      for (const peer of peers) peerstore.add(peer);

      if (!device.canProduce("audio")) {
        setroomstore({
          state: "connected",
          warn_message: "cannot consume your audio due to some unknown error"
        });

        toast.info("connected");

        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: micid ? { deviceId: micid } : true
      });

      const track = stream.getAudioTracks()[0]!;

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

        await router.replace("/rooms");
      });

      producerstore.add(producer);

      setroomstore({ state: "connected" });
    } catch (e) {
      const error = e as Error;
      console.error("[useRoom.join()] error", error);

      reset({
        room: {
          state: "error",
          error: "errors" in error ? (error as EventError) : error.message
        }
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
      payload: {
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
      payload: {
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
      payload: {
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

function loaddevice(): Device {
  let handlername = detectDevice();

  if (!handlername) handlername = "Chrome74";

  return new Device({ handlerName: handlername });
}
