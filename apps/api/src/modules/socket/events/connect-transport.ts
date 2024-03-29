import type { CallbackEvent } from "../types";
import { NoTransportFoundError } from "../utils";

export const handler: CallbackEvent<"connect transport"> = {
  on: "connect transport",
  invoke: async ({ peer, payload, cb }) => {
    const transport = peer.transports.get(payload.transport_id);

    if (!transport) throw new NoTransportFoundError();

    await transport.connect({ dtlsParameters: payload.dtls_parameters });

    cb();
  }
};
