import { Event } from "../types";
import { ChatMessage } from "types";
import { nanoid } from "nanoid";

const handler: Event<"chat message"> = {
  on: "chat message",
  invoke: async ({ peer, payload }) => {
    if (!peer.activeRoomId) {
      throw new Error("peer not a member of any room");
    }

    const message: ChatMessage = {
      _id: nanoid(24),
      content: payload.content,
      creator: peer.user,
      created_at: new Date().toISOString()
    };

    return {
      emit: "chat message",
      to: [peer.activeRoomId],
      send: {
        message
      }
    };
  }
};

export default handler;
