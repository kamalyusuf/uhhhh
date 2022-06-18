import { Event } from "../types";
import { MediasoupRoom } from "../../mediasoup/room";

const handler: Event<"leave"> = {
  on: "leave",
  invoke: async ({ peer, socket, cb }) => {
    if (!peer.active_room_id) return cb();

    const rid = peer.active_room_id;
    const room = MediasoupRoom.findById(rid);

    await room.leave(peer);

    socket.leave(rid);
    socket.to(rid).emit("peer left", { peer: peer.user });

    cb();
  }
};

export default handler;
