import type { Event } from "../types";
import type { ChatMessage } from "types";
import crypto from "crypto";
import { NotJoinedError } from "../utils";

export const handler: Event<"chat message"> = {
  on: "chat message",
  invoke: ({ peer, data, io }) => {
    if (!peer.active_room_id) throw new NotJoinedError();

    const message: ChatMessage = {
      _id: crypto.randomUUID(),
      content: data.content,
      creator: peer.user,
      created_at: new Date().toISOString()
    };

    io.to(peer.active_room_id).emit("chat message", { message });
  }
};
