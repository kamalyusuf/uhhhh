import { Event } from "../types";

const handler: Event<"connect transport"> = {
  on: "connect transport",
  invoke: async ({ peer, payload, cb }) => {
    const transport = peer.transports.get(payload.transport_id);

    if (!transport) return;
    // throw new Error(`no transport with id ${payload.transport_id} found`);

    await transport.connect({ dtlsParameters: payload.dtls_parameters });

    cb();
  }
};

export default handler;
