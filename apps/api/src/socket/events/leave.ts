import { Event } from "../types";
import { MediasoupRoom } from "../../mediasoup/room";

const handler: Event<"leave"> = {
  on: "leave",
  invoke: async ({ io, peer, socket, cb }) => {
    if (!peer.activeRoomId) {
      throw new Error("peer not a memeber of any room");
    }

    const rid = peer.activeRoomId;
    const room = MediasoupRoom.findById(rid);

    await room.leave(peer);

    socket.leave(rid);
    socket.to(rid).emit("peer left", { peer: peer.user });

    cb(undefined);
  }
};

export default handler;
