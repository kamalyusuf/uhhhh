import { Event } from "../types";
import { MediasoupRoom } from "../../mediasoup/room";

const handler: Event<"leave"> = {
  on: "leave",
  invoke: async ({ peer, payload: { room_id }, socket, cb }) => {
    const room = MediasoupRoom.findById(room_id);

    room.leave(peer);

    socket.leave(room_id);
    socket.to(room_id).emit("peer left", { peer: peer.user });

    cb(undefined);
  }
};

export default handler;
