import { useRef } from "react";
import { useRoomStore } from "../../store/room";
import { useSocket } from "../../hooks/useSocket";
import { request } from "../../lib/request";
import { detectDevice, Device } from "mediasoup-client";
import { useTransportStore } from "../../store/transport";
import { toast } from "react-toastify";
import { usePeerStore } from "../../store/peer";
import { useProducerStore } from "../../store/producer";
import { useMicStore } from "../../store/mic";
import { unstable_batchedUpdates as batch } from "react-dom";

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
  const { socket } = useSocket();
  const device = useRef(getDevice()).current;
  const transportStore = useTransportStore();
  const peerStore = usePeerStore();
  const producerStore = useProducerStore();
  const micStore = useMicStore();
  const roomStore = useRoomStore();

  const join = async () => {
    try {
      setState("connecting");

      if (roomStore.state === "connected") {
        await leave();
      }

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
        data: {
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

      const { peers } = await request({
        socket,
        event: "join",
        data: {
          room_id,
          rtp_capabilities: device.rtpCapabilities
        }
      });

      for (const peer of peers) {
        peerStore.add(peer);
      }

      if (!device.canProduce("audio")) {
        setState("connected");
        toast.info("connected");
        return toast.warn("cannot produce audio");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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

      producer.on("trackended", () => {
        toast.error("microphone disconnected");
      });

      producerStore.add(producer);

      setState("connected");
    } catch (e) {
      setState("error");
    }
  };

  const leave = async () => {
    await request({
      socket,
      event: "leave",
      data: undefined
    });

    batch(() => {
      micStore.reset();
      transportStore.reset();
      producerStore.reset();
      peerStore.reset();
      roomStore.reset();
    });
  };

  return { join, leave };
};
