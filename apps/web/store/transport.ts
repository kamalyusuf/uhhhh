import { Transport } from "mediasoup-client/lib/types";
import create from "zustand";
import { combine, devtools } from "zustand/middleware";

const store = combine(
  {
    send_transport: null as Transport | null,
    receive_transport: null as Transport | null
  },
  (set) => ({
    setSendTransport: (send_transport: Transport | null) =>
      set({ send_transport }),
    setReceiveTransport: (receive_transport: Transport | null) =>
      set({ receive_transport }),
    resetSendTransport: () =>
      set((state) => {
        state.send_transport?.close();
        return { send_transport: null };
      }),
    resetReceiveTransport: () =>
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

export const useTransportStore = create(
  devtools(store, { name: "TransportStore" })
);
