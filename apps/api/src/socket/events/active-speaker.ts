import { MediasoupRoom } from "../../mediasoup/room";
import { Event } from "../types";
import { logger } from "../../lib/logger";

const handler: Event<"active speaker"> = {
  on: "active speaker",
  // @ts-ignore
  invoke: async ({ peer, payload }) => {
    if (!peer.activeRoomId) {
      logger.log({
        level: "warn",
        dev: true,
        message: `[active speaker] peer ${peer.user.display_name} isn't a member of any room. finna return`
      });

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
        speaking: payload.speaking
      }
    };
  }
};

export default handler;
