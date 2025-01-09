import { NotInRoomError } from "../errors.js";
import type { Event } from "../types.js";
import type { ChatMessage } from "types";
import { nanoid } from "nanoid";

export const handler: Event<"chat message"> = {
  on: "chat message",
  input: (s) => ({
    content: s.string().max(120)
  }),
  invoke: ({ peer, payload, io }) => {
    if (!peer.active_room_id) throw new NotInRoomError();

    const message: ChatMessage = {
      _id: nanoid(8),
      content: payload.content,
      creator: peer.user,
      created_at: new Date().toISOString()
    };

    io.to(peer.active_room_id).emit("chat message", { message });
  }
};
