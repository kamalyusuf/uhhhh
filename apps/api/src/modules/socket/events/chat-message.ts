import { randomUUID } from "node:crypto";
import { NotInRoomError } from "../errors.js";
import type { Event } from "../types.js";
import type { ChatMessage } from "types";

export const handler: Event<"chat message"> = {
  on: "chat message",
  input: (s) => ({
    content: s.string().max(120)
  }),
  invoke: ({ peer, payload, io }) => {
    if (!peer.active_room_id) throw new NotInRoomError();

    const message: ChatMessage = {
      _id: randomUUID().replace(/-/g, ""),
      content: payload.content,
      creator: peer.user,
      created_at: new Date().toISOString()
    };

    io.to(peer.active_room_id).emit("chat message", { message });
  }
};
