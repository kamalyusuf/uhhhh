import { MediasoupRoom } from "../../mediasoup/room";
import { Event } from "../types";

const handler: Event<"active speaker"> = {
  on: "active speaker",
  invoke: ({ peer, payload, io }) => {
    if (!peer.active_room_id) return;

    const room = MediasoupRoom.findById(peer.active_room_id);

    if (!room.hasPeer(peer.user._id)) return;

    io.to(room.id).emit("active speaker", {
      peer_id: peer.user._id,
      speaking: payload.speaking
    });
  }
};

export default handler;
