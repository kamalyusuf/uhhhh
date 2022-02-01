import { useEffect } from "react";
import { useSocket } from "../../hooks/useSocket";
import { useTransportStore } from "../../store/transport";
import { useConsumerStore } from "../../store/consumer";
import { usePeerStore } from "../../store/peer";
import { toast } from "react-toastify";
import { useRoomStore } from "../../store/room";
import { useQueryClient } from "react-query";
import { Room } from "types";

export const SocketHandler = () => {
  const { socket } = useSocket();
  const transportStore = useTransportStore();
  const consumerStore = useConsumerStore();
  const peerStore = usePeerStore();
  const roomStore = useRoomStore();
  const client = useQueryClient();

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

        socket.emit("consumer consumed", {
          consumer_id: consumer.id
        });
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

    socket.on("peer left", ({ peer }) => {
      peerStore.remove(peer._id);
    });

    socket.on("active speaker", ({ peer_id, speaking }) => {
      roomStore.setActiveSpeaker(peer_id, speaking);
    });

    socket.on("delete room", ({ room_id }) => {
      client.setQueryData<{ rooms: Room[] } | undefined>("rooms", (cached) => {
        if (!cached) return undefined;

        return {
          rooms: cached.rooms.filter((room) => room._id !== room_id)
        };
      });
    });

    socket.on("create room", ({ room }) => {
      client.setQueryData<{ rooms: Room[] } | undefined>("rooms", (cached) => {
        if (!cached) return undefined;

        return {
          rooms: [...cached.rooms, room]
        };
      });
    });

    return () => {
      socket.removeAllListeners();
    };
  }, [socket, transportStore.receive_transport]);

  return null;
};
