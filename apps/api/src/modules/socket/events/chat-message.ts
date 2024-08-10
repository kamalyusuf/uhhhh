import type { Event, EventPayload } from "../types.js";
import type { ChatMessage } from "types";
import crypto from "node:crypto";
import { NotInRoomError } from "../utils.js";

export const handler: Event<"chat message"> = {
  on: "chat message",
  schema: (s) =>
    s.object<EventPayload<"chat message">>({
      content: s.string()
    }),
  invoke: ({ peer, payload, io }) => {
    if (!peer.active_room_id) throw new NotInRoomError();

    const message: ChatMessage = {
      _id: crypto.randomUUID(),
      content: payload.content,
      creator: peer.user,
      created_at: new Date().toISOString()
    };

    io.to(peer.active_room_id).emit("chat message", { message });
  }
};
