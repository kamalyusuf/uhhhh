import { useEffect } from "react";
import { useSocket } from "./socket-provider";
import { useTransportStore } from "../../store/transport";
import { useConsumerStore } from "../../store/consumer";
import { usePeerStore } from "../../store/peer";
import { toast } from "react-toastify";
import { useRoomStore } from "../../store/room";
import { useRoomChatStore } from "../../store/room-chat";
import { useUpdateSocketQuery } from "../../hooks/use-update-socket-query";
import { useSettingsStore } from "../../store/settings";
import { reset } from "../../utils/reset";

export const SocketHandler = () => {
  const { socket } = useSocket();
  const updatequery = useUpdateSocketQuery();
  const addchat = useRoomChatStore((state) => state.add);
  const setactivespeaker = useRoomStore((state) => state.setactivespeaker);
  const setroomstore = useRoomStore((state) => state.set);
  const addpeer = usePeerStore((state) => state.add);
  const removepeer = usePeerStore((state) => state.remove);
  const notifyonjoin = useSettingsStore((state) => state.notify_on_join);
  const receivetransport = useTransportStore(
    (state) => state.receive_transport
  );
  const consumerstore = useConsumerStore((state) => ({
    add: state.add,
    remove: state.remove,
    pause: state.pause,
    resume: state.resume
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
        if (!receivetransport) return;

        const consumer = await receivetransport.consume({
          id,
          producerId: producer_id,
          kind,
          rtpParameters: rtp_parameters,
          appData: {
            ...app_data,
            peer_id
          }
        });

        consumerstore.add({
          consumer,
          paused: producer_paused,
          peer_id
        });

        socket.emit("consumer consumed", {
          consumer_id: consumer.id
        });
      }
    );

    socket.on("new peer", ({ peer }) => {
      addpeer(peer);

      if (notifyonjoin) toast.info(`${peer.display_name} has joined the room`);
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
      removepeer(peer._id);
    });

    socket.on("active speaker", ({ peer_id, speaking }) => {
      setactivespeaker(peer_id, speaking);
    });

    socket.on("delete room", ({ room_id }) => {
      updatequery("rooms", (draft) => {
        const index = draft.rooms.findIndex((room) => room._id === room_id);

        if (index > -1) draft.rooms.splice(index, 1);
      });
    });

    socket.on("create room", ({ room }) => {
      updatequery("rooms", (draft) => {
        draft.rooms.unshift(room);
      });
    });

    socket.on("chat message", ({ message }) => {
      addchat(message);
    });

    socket.on("update room members count", ({ room_id, members_count }) => {
      updatequery("rooms", (draft) => {
        const room = draft.rooms.find((room) => room._id === room_id);

        if (room) room.members_count = members_count;
      });
    });

    socket.on("room session at", ({ in_session_at }) => {
      setroomstore({ in_session_at });
    });

    socket.on("transport closed", () => {
      reset("closed");
    });

    return () => {
      socket.removeAllListeners();
    };
  }, [socket, receivetransport, notifyonjoin]);

  return null;
};
