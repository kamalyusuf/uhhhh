import { MediasoupRoom } from "../../mediasoup/room";
import type { CallbackEvent } from "../types";
import { env } from "../../../lib/env";

export const handler: CallbackEvent<"create transport"> = {
  on: "create transport",
  invoke: async ({ peer, data: { room_id, direction }, cb }) => {
    const room = MediasoupRoom.findbyid(room_id);

    const transport = await room.router.createWebRtcTransport({
      listenIps: [{ ip: env.LISTEN_IP, announcedIp: env.ANNOUNCED_IP }],
      initialAvailableOutgoingBitrate: 1000000,
      maxSctpMessageSize: 262144,
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
      appData: {
        peer_id: peer.user._id,
        direction
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
