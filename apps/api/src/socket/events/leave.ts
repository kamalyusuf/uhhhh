import { Event } from "../types";
import { MediasoupRoom } from "../../mediasoup/room";

const handler: Event<"leave"> = {
  on: "leave",
  invoke: async ({ peer, socket, cb }) => {
    if (!peer.activeRoomId) {
      throw new Error("peer not a memeber room");
    }

    const rid = peer.activeRoomId;
    const room = MediasoupRoom.findById(rid);

    room.leave(peer);

    socket.leave(rid);
    socket.to(rid).emit("peer left", { peer: peer.user });

    cb(undefined);
  }
};

export default handler;
