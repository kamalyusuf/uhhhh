import { Transport } from "mediasoup-client/lib/types";
import create from "zustand";
import { combine, devtools } from "zustand/middleware";

const store = combine(
  {
    send_transport: null as Transport | null,
    receive_transport: null as Transport | null
  },
  (set) => ({ set })
);

export const useVoiceStore = create(devtools(store, { name: "VoiceStore" }));
