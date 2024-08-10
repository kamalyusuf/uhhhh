import type { CallbackEvent } from "../types.js";
import { MediasoupRoom } from "../../mediasoup/room.js";

export const handler: CallbackEvent<"join"> = {
  on: "join",
  invoke: async ({ peer, payload, socket, cb }) => {
    if (peer.active_room_id)
      throw new Error(
        peer.active_room_id === payload.room_id
          ? "already in room"
          : "already in a room"
      );

    const room = MediasoupRoom.findbyid(payload.room_id);

    if (room.has(peer.user._id)) throw new Error("already in room");

    peer.rtp_capabilities = payload.rtp_capabilities;
    room.join(peer);

    socket.join(room.id);
    peer.active_room_id = room.id;

    const peers = room.findpeers({ except: peer.user._id });

    for (const otherpeer of peers)
      for (const producer of otherpeer.producers.values())
        await room.createconsumer({
          consumer_peer: peer,
          producer_peer: otherpeer,
          producer
        });

    socket.to(payload.room_id).emit("new peer", { peer: peer.user });

    cb({ peers: Array.from(peers.values()).map((peer) => peer.user) });
  }
};
