import { useEffect } from "react";
import { useSocket } from "../../hooks/useSocket";
import { useVoiceStore } from "../../store/voice";
import { useConsumerStore } from "../../store/consumer";
import { usePeerStore } from "../../store/peer";
import { toast } from "react-toastify";

export const SocketHandler = () => {
  const { socket } = useSocket();
  const voiceStore = useVoiceStore();
  const consumerStore = useConsumerStore();
  const peerStore = usePeerStore();

  useEffect(() => {
    if (!socket) return;

    socket.on(
      "new consumer",
      async ({
        peer_id,
        producer_id,
        id,
        kind,
        rtp_parameters,
        type,
        app_data,
        producer_paused
      }) => {
        if (!voiceStore.receive_transport) {
          return;
        }

        const consumer = await voiceStore.receive_transport.consume({
          id,
          producerId: producer_id,
          kind,
          rtpParameters: rtp_parameters,
          appData: {
            ...app_data,
            peer_id
          }
        });

        consumerStore.add(consumer, peer_id);
      }
    );

    socket.on("new peer", ({ peer }) => {
      peerStore.add(peer);
      toast.info(`${peer.display_name} has joined the room`);
    });

    socket.on("consumer closed", ({ consumer_id }) => {
      consumerStore.remove(consumer_id);
    });

    socket.on("consumer paused", ({ consumer_id }) => {
      consumerStore.pause(consumer_id);
    });

    socket.on("consumer resumed", ({ consumer_id }) => {
      consumerStore.pause(consumer_id);
    });

    return () => {
      socket.removeAllListeners();
    };
  }, [socket, voiceStore.receive_transport]);

  return null;
};
