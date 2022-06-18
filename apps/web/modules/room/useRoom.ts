import { useRef, useCallback } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { unstable_batchedUpdates as batch } from "react-dom";
import { useRoomStore } from "../../store/room";
import { useSocket } from "../../hooks/useSocket";
import { request } from "../../utils/request";
import { detectDevice, Device } from "mediasoup-client";
import { useTransportStore } from "../../store/transport";
import { usePeerStore } from "../../store/peer";
import { useProducerStore } from "../../store/producer";
import { useMicStore } from "../../store/mic";
import { useRoomChatStore } from "../../store/room-chat";

const d = () => {
  let handlerName = detectDevice();

  if (!handlerName) handlerName = "Chrome74";

  return new Device({ handlerName });
};

// const PC_PROPRIETARY_CONSTRAINTS = {
//   optional: [{ googDscp: true }]
// };

export const useRoom = (room_id: string) => {
  const { socket } = useSocket();
  const device = useRef(d()).current;
  const transportStore = useTransportStore();
  const peerStore = usePeerStore();
  const producerStore = useProducerStore();
  const micStore = useMicStore();
  const roomStore = useRoomStore();
  const chatStore = useRoomChatStore();
  const router = useRouter();

  const join = useCallback(async () => {
    try {
      if (roomStore.state === "connected") await leave();

      roomStore.setState("connecting");

      if (producerStore.producer) producerStore.reset();

      if (transportStore.send_transport) transportStore.resetSendTransport();

      if (transportStore.receive_transport)
        transportStore.resetReceiveTransport();

      const { rtp_capabilities: routerRtpCapabilities } = await request({
        socket,
        event: "rtp capabilities",
        payload: {
          room_id
        }
      });

      await device.load({ routerRtpCapabilities });

      {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: micStore.id ? { deviceId: micStore.id } : true
        });
        const track = stream.getAudioTracks()[0];

        track.enabled = false;

        setTimeout(() => track.stop(), 120000);
      }

      const { transport_options: sendTransportOptions } = await request({
        socket,
        event: "create transport",
        payload: {
          room_id,
          producing: true,
          consuming: false,
          direction: "send"
        }
      });

      const sendTransport = device.createSendTransport({
        id: sendTransportOptions.id,
        iceParameters: sendTransportOptions.ice_parameters,
        iceCandidates: sendTransportOptions.ice_candidates,
        dtlsParameters: {
          ...sendTransportOptions.dtls_parameters,
          role: "auto"
        },
        iceServers: []
        // proprietaryConstraints: PC_PROPRIETARY_CONSTRAINTS
      });

      sendTransport.on(
        "connect",
        ({ dtlsParameters: dtls_parameters }, callback, errorback) => {
          request({
            socket,
            event: "connect transport",
            payload: {
              room_id,
              transport_id: sendTransport.id,
              dtls_parameters
            }
          })
            .then(callback)
            .catch(errorback);
        }
      );

      sendTransport.on(
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
                transport_id: sendTransport.id,
                kind,
                rtp_parameters,
                app_data
              }
            });

            callback({ id });
          } catch (e) {
            errorback(e);
          }
        }
      );

      transportStore.setSendTransport(sendTransport);

      const { transport_options: receiveTransportOptions } = await request({
        socket,
        event: "create transport",
        payload: {
          room_id,
          producing: false,
          consuming: true,
          direction: "receive"
        }
      });

      const receiveTransport = device.createRecvTransport({
        id: receiveTransportOptions.id,
        iceParameters: receiveTransportOptions.ice_parameters,
        iceCandidates: receiveTransportOptions.ice_candidates,
        dtlsParameters: {
          ...receiveTransportOptions.dtls_parameters,
          role: "auto"
        },
        iceServers: []
      });

      transportStore.setReceiveTransport(receiveTransport);

      receiveTransport.on(
        "connect",
        ({ dtlsParameters: dtls_parameters }, callback, errorback) => {
          request({
            socket,
            event: "connect transport",
            payload: {
              room_id,
              transport_id: receiveTransport.id,
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

      for (const peer of peers) peerStore.add(peer);

      if (!device.canProduce("audio")) {
        roomStore.set({
          state: "connected",
          warn_message: " cannot consume your audio due to some unknown error",
          show_warning: true
        });

        toast.info("connected");

        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: micStore.id ? { deviceId: micStore.id } : true
      });

      const track = stream.getAudioTracks()[0];

      micStore.setStream(stream);
      micStore.setTrack(track);

      const producer = await sendTransport.produce({
        track,
        codecOptions: {
          opusStereo: true,
          opusDtx: true
        }
      });

      producer.on("transportclose", () => {
        producerStore.set({ producer: null });
      });

      producer.on("trackended", async () => {
        toast.warn("microphone disconnected");

        await leave();

        router.replace("/rooms");
      });

      producerStore.add(producer);

      roomStore.setState("connected");
    } catch (e) {
      // micStore.reset();
      // transportStore.reset();
      // producerStore.reset();
      // peerStore.reset();
      // chatStore.reset();
      // roomStore.set({
      //   state: "error",
      //   error_message: e.message,
      //   active_speakers: {},
      //   warn_message: "",
      //   show_warning: false
      // });

      console.log("[useRoom.join] error", e);

      batch(() => {
        micStore.reset();
        transportStore.reset();
        producerStore.reset();
        peerStore.reset();
        chatStore.reset();
        roomStore.set({
          state: "error",
          error_message: e.message,
          active_speakers: {},
          warn_message: "",
          show_warning: false
        });
      });
    }
  }, [
    room_id,
    socket,
    roomStore.state,
    producerStore.producer,
    transportStore.send_transport,
    transportStore.receive_transport
  ]);

  const leave = useCallback(async () => {
    await request({
      socket,
      event: "leave",
      payload: undefined
    });

    batch(() => {
      micStore.reset();
      transportStore.reset();
      producerStore.reset();
      peerStore.reset();
      roomStore.reset();
      chatStore.reset();
    });
  }, [socket]);

  const mute = useCallback(async () => {
    const producer = producerStore.producer;

    if (!producer) return;

    producer.pause();

    await request({
      socket,
      event: "pause producer",
      payload: {
        producer_id: producer.id
      }
    });

    producerStore.setPaused(true);
  }, [producerStore.producer, socket]);

  const unmute = useCallback(async () => {
    const producer = producerStore.producer;

    if (!producer) return;

    producer.resume();

    await request({
      socket,
      event: "resume producer",
      payload: {
        producer_id: producer.id
      }
    });

    producerStore.setPaused(false);
  }, [producerStore.producer, socket]);

  const disable = useCallback(async () => {
    const producer = producerStore.producer;

    if (!producer) return;

    producer.close();

    await request({
      socket,
      event: "close producer",
      payload: {
        producer_id: producer.id
      }
    });

    producerStore.remove();
  }, [producerStore.producer, socket]);

  return { join, leave, mute, unmute };
};
