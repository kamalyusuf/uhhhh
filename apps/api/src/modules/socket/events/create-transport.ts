import { MediasoupRoom } from "../../mediasoup/room.js";
import { env } from "../../../lib/env.js";
import type { CallbackEvent } from "../types.js";
import type { AppData } from "../../mediasoup/types.js";

export const handler: CallbackEvent<"create transport"> = {
  on: "create transport",
  invoke: async ({ peer, socket, payload: { room_id, direction }, cb }) => {
    const room = MediasoupRoom.findbyid(room_id);

    const transport = await room.router.createWebRtcTransport<AppData>({
      listenIps: [{ ip: env.LISTEN_IP, announcedIp: env.ANNOUNCED_IP }],
      initialAvailableOutgoingBitrate: 1000000,
      maxSctpMessageSize: 262144,
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
      iceConsentTimeout: 20,
      appData: {
        peer_id: peer.user._id,
        direction
      }
    });

    transport.on("icestatechange", (state) => {
      if (state === "disconnected" || state === "closed") {
        if (room.has(peer.user._id)) room.leave(peer);
        else peer.reset();

        socket.emit("transport closed", { room_id: room.id });
      }
    });

    transport.on("dtlsstatechange", (state) => {
      if (state === "failed" || state === "closed") {
        if (room.has(peer.user._id)) room.leave(peer);
        else peer.reset();

        socket.emit("transport closed", { room_id: room.id });
      }
    });

    peer.transports.set(transport.id, transport);

    await transport.setMaxIncomingBitrate(1500000);

    cb({
      transport_options: {
        id: transport.id,
        ice_parameters: transport.iceParameters,
        ice_candidates: transport.iceCandidates,
        dtls_parameters: transport.dtlsParameters,
        sctp_parameters: transport.sctpParameters
      }
    });
  }
};
