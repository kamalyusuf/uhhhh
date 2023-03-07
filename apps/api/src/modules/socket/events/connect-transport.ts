import type { CallbackEvent } from "../types";
import { NoTransportFoundError } from "../utils";

export const handler: CallbackEvent<"connect transport"> = {
  on: "connect transport",
  invoke: async ({ peer, data, cb }) => {
    const transport = peer.transports.get(data.transport_id);

    if (!transport) throw new NoTransportFoundError(data.transport_id);

    await transport.connect({ dtlsParameters: data.dtls_parameters });

    cb();
  }
};
