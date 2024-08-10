import { createstore } from "../utils/store";
import type { Transport } from "mediasoup-client/lib/types";

interface TransportStore {
  send_transport: Transport | null;
  receive_transport: Transport | null;
  setsendtransport: (transport: Transport) => void;
  setreceivetransport: (transport: Transport) => void;
  resetsendtransport: () => void;
  resetreceivetransport: () => void;
  reset: () => void;
}

export const useTransportStore = createstore<TransportStore>(
  "Transport",
  (set) => ({
    send_transport: null,
    receive_transport: null,

    setsendtransport: (transport) => set({ send_transport: transport }),

    setreceivetransport: (transport) => set({ receive_transport: transport }),

    resetsendtransport: () =>
      set((state) => {
        state.send_transport?.close();

        return { send_transport: null };
      }),

    resetreceivetransport: () =>
      set((state) => {
        state.receive_transport?.close();

        return { receive_transport: null };
      }),

    reset: () =>
      set((state) => {
        state.send_transport?.close();
        state.receive_transport?.close();

        return { send_transport: null, receive_transport: null };
      })
  })
);
