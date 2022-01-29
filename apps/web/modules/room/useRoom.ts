import { useEffect, useState, useRef } from "react";
import { useRoomStore } from "../../store/room";
import { useSocket } from "../../hooks/useSocket";
import { request } from "../../lib/request";
import { Room } from "types";
import { detectDevice, Device } from "mediasoup-client";
import { useVoiceStore } from "../../store/voice";
import { useMeStore } from "../../store/me";
import { toast } from "react-toastify";
import { usePeerStore } from "../../store/peer";
import { useProducerStore } from "../../store/producer";

const getDevice = () => {
  let handlerName = detectDevice();
  if (!handlerName) {
    handlerName = "Chrome74";
  }

  return new Device({ handlerName });
};

const PC_PROPRIETARY_CONSTRAINTS = {
  optional: [{ googDscp: true }]
};

export const useRoom = (room_id: string) => {
  const { setState } = useRoomStore();
  const socket = useSocket();
  // const { device } = useDeviceStore();
  const device = useRef(getDevice()).current;
  const voiceStore = useVoiceStore();
  const { me } = useMeStore();
  const peerStore = usePeerStore();
  const producerStore = useProducerStore();
  const { producer } = producerStore;

  const join = async () => {
    try {
      setState("connecting");

      const { rtp_capabilities: routerRtpCapabilities } = await request({
        socket,
        event: "rtp capabilities",
        data: {
          room_id
        }
      });

      await device.load({ routerRtpCapabilities });

      {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true
        });
        const track = stream.getAudioTracks()[0];

        track.enabled = false;

        setTimeout(() => track.stop(), 120000);
      }

      const { transport_options: sendTransportOptions } = await request({
        socket,
        event: "create transport",
        data: {
          room_id,
          producing: true,
          consuming: false
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
        iceServers: [],
        proprietaryConstraints: PC_PROPRIETARY_CONSTRAINTS
      });

      sendTransport.on(
        "connect",
        ({ dtlsParameters: dtls_parameters }, callback, errorback) => {
          request({
            socket,
            event: "connect transport",
            data: {
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
          { kind, rtpParameters: rtp_parameters },
          callback,
          errorback
        ) => {
          try {
            const { id } = await request({
              socket,
              event: "produce",
              data: {
                room_id,
                transport_id: sendTransport.id,
                kind,
                rtp_parameters
              }
            });

            callback({ id });
          } catch (e) {
            errorback(e);
          }
        }
      );

      voiceStore.set({ send_transport: sendTransport });

      const { transport_options: receiveTransportOptions } = await request({
        socket,
        event: "create transport",
        data: {
          room_id,
          producing: false,
          consuming: true
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

      voiceStore.set({ receive_transport: receiveTransport });

      receiveTransport.on(
        "connect",
        ({ dtlsParameters: dtls_parameters }, callback, errorback) => {
          request({
            socket,
            event: "connect transport",
            data: {
              room_id,
              transport_id: receiveTransport.id,
              dtls_parameters
            }
          })
            .then(callback)
            .catch(errorback);
        }
      );

      const { users: peers } = await request({
        socket,
        event: "join",
        data: {
          room_id,
          user: me,
          rtp_capabilities: device.rtpCapabilities
        }
      });

      setState("connected");

      toast.info("connected");

      for (const peer of peers) {
        peerStore.add({ ...peer, consumers: [] });
      }

      await enableMic();
    } catch (e) {
      console.log("could not join room", e);
    }
  };

  const enableMic = async () => {
    if (producerStore.producer) return;

    if (!device.canProduce("audio")) {
      return toast.error("cannot produce audio");
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const track = stream.getAudioTracks()[0];

    const producer = await voiceStore.send_transport.produce({
      track,
      codecOptions: {
        opusStereo: true,
        opusDtx: true
      }
    });

    producerStore.add(producer);

    producerStore.producer.on("transportclose", () => {
      producerStore.set({ producer: null });
    });

    producerStore.producer.on("trackended", () => {
      toast.error("microphone disconnected");
      disableMic();
    });
  };

  const disableMic = async () => {
    if (!producer) return;

    if (producer.closed) return;

    producer.close();

    await request({
      socket,
      event: "close producer",
      data: {
        room_id,
        producer_id: producer.id
      }
    });

    producerStore.remove();
  };

  const mute = async () => {
    producer.pause();

    await request({
      socket,
      event: "pause producer",
      data: {
        room_id,
        producer_id: producer.id
      }
    });
  };

  const unmute = async () => {
    producer.resume();

    await request({
      socket,
      event: "resume producer",
      data: {
        room_id,
        producer_id: producer.id
      }
    });
  };

  return { join, mute, unmute };
};
