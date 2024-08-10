import type { CallbackEvent } from "../types.js";
import { NoTransportFoundError } from "../utils.js";

export const handler: CallbackEvent<"connect transport"> = {
  on: "connect transport",
  invoke: async ({ peer, payload, cb }) => {
    const transport = peer.transports.get(payload.transport_id);

    if (!transport) throw new NoTransportFoundError();

    await transport.connect({ dtlsParameters: payload.dtls_parameters });

    cb();
  }
};
