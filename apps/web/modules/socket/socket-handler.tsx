import { useEffect } from "react";
import { useSocket } from "../../hooks/use-socket";
import { useTransportStore } from "../../store/transport";
import { useConsumerStore } from "../../store/consumer";
import { usePeerStore } from "../../store/peer";
import { toast } from "react-toastify";
import { useRoomStore } from "../../store/room";
import { useQueryClient } from "@tanstack/react-query";
import type { Room } from "types";
import { useRoomChatStore } from "../../store/room-chat";

export const SocketHandler = () => {
  const { socket } = useSocket();
  const client = useQueryClient();
  const chatstore = useRoomChatStore((state) => ({ add: state.add }));
  const consumerstore = useConsumerStore((state) => ({
    add: state.add,
    remove: state.remove,
    pause: state.pause,
    resume: state.resume
  }));
  const peerstore = usePeerStore((state) => ({
    add: state.add,
    remove: state.remove
  }));
  const roomstore = useRoomStore((state) => ({
    setactivespeaker: state.setactivespeaker,
    set: state.set
  }));
  const transportstore = useTransportStore((state) => ({
    receive_transport: state.receive_transport
  }));

  useEffect(() => {
    if (!socket) return;

    socket.on("error", (error) => {
      error.errors.forEach((e) => toast.error(e.message));
    });

    socket.on(
      "new consumer",
      async ({
        peer_id,
        producer_id,
        id,
        kind,
        rtp_parameters,
        app_data,
        producer_paused
      }) => {
        if (!transportstore.receive_transport) return;

        const consumer = await transportstore.receive_transport.consume({
          id,
          producerId: producer_id,
          kind,
          rtpParameters: rtp_parameters,
          appData: {
            ...app_data,
            peer_id
          }
        });

        consumerstore.add(peer_id, consumer, producer_paused);

        socket.emit("consumer consumed", {
          consumer_id: consumer.id
        });
      }
    );

    socket.on("new peer", ({ peer }) => {
      peerstore.add(peer);

      toast.info(`${peer.display_name} has joined the room`);
    });

    socket.on("consumer closed", ({ peer_id }) => {
      consumerstore.remove(peer_id);
    });

    socket.on("consumer paused", ({ peer_id }) => {
      consumerstore.pause(peer_id);
    });

    socket.on("consumer resumed", ({ peer_id }) => {
      consumerstore.resume(peer_id);
    });

    socket.on("peer left", ({ peer }) => {
      peerstore.remove(peer._id);
    });

    socket.on("active speaker", ({ peer_id, speaking }) => {
      roomstore.setactivespeaker(peer_id, speaking);
    });

    socket.on("delete room", ({ room_id }) => {
      client.setQueryData<{ rooms: Room[] }>(["rooms"], (cached) => {
        if (!cached) return undefined;

        return {
          rooms: cached.rooms.filter((room) => room._id !== room_id)
        };
      });
    });

    socket.on("create room", ({ room }) => {
      client.setQueryData<{ rooms: Room[] }>(["rooms"], (cached) => {
        if (!cached) return undefined;

        return {
          rooms: [...cached.rooms, room]
        };
      });
    });

    socket.on("chat message", ({ message }) => {
      chatstore.add(message);
    });

    socket.on("update room members count", ({ room_id, members_count }) => {
      client.setQueryData<{ rooms: Room[] } | undefined>(
        ["rooms"],
        (cached) => {
          if (!cached) return undefined;

          return {
            rooms: cached.rooms.map((room) => {
              if (room._id === room_id)
                return {
                  ...room,
                  members_count
                };
              else return room;
            })
          };
        }
      );
    });

    socket.on("room session at", ({ in_session_at }) => {
      roomstore.set({ in_session_at });
    });

    return () => {
      socket.removeAllListeners();
    };
  }, [socket, transportstore.receive_transport]);

  return null;
};
