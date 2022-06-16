import { Event } from "../types";
import { ChatMessage } from "types";
import crypto from "crypto";

const handler: Event<"chat message"> = {
  on: "chat message",
  invoke: ({ peer, payload, io }) => {
    if (!peer.active_room_id) return;

    const message: ChatMessage = {
      _id: crypto.randomUUID(),
      content: payload.content,
      creator: peer.user,
      created_at: new Date().toISOString()
    };

    io.to(peer.active_room_id).emit("chat message", { message });
  }
};

export default handler;
