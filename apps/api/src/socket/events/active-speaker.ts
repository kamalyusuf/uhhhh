import { MediasoupRoom } from "../../mediasoup/room";
import { Event } from "../types";

const handler: Event<"active speaker"> = {
  on: "active speaker",
  // @ts-ignore
  invoke: async ({ peer, payload }) => {
    if (!peer.activeRoomId) {
      return;
    }

    const room = MediasoupRoom.findById(peer.activeRoomId);
    if (!room.hasPeer(peer.user._id)) {
      throw new Error("peer not a member of room");
    }

    return {
      emit: "active speaker",
      to: [room.id],
      send: {
        peer_id: peer.user._id,
        value: payload.value
      }
    };
  }
};

export default handler;
