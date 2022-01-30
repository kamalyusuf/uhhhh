import { useEffect } from "react";
import { useSocket } from "../../hooks/useSocket";
import { useTransportStore } from "../../store/transport";
import { useConsumerStore } from "../../store/consumer";
import { usePeerStore } from "../../store/peer";
import { toast } from "react-toastify";

export const SocketHandler = () => {
  const { socket } = useSocket();
  const transportStore = useTransportStore();
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
        if (!transportStore.receive_transport) {
          return;
        }

        const consumer = await transportStore.receive_transport.consume({
          id,
          producerId: producer_id,
          kind,
          rtpParameters: rtp_parameters,
          appData: {
            ...app_data,
            peer_id
          }
        });

        consumerStore.add(peer_id, consumer);
      }
    );

    socket.on("new peer", ({ peer }) => {
      peerStore.add(peer);
      toast.info(`${peer.display_name} has joined the room`);
    });

    socket.on("consumer closed", ({ consumer_id, peer_id }) => {
      consumerStore.remove(peer_id);
    });

    socket.on("consumer paused", ({ consumer_id, peer_id }) => {
      consumerStore.pause(peer_id);
    });

    socket.on("consumer resumed", ({ consumer_id, peer_id }) => {
      consumerStore.pause(peer_id);
    });

    return () => {
      socket.removeAllListeners();
    };
  }, [socket, transportStore.receive_transport]);

  return null;
};
