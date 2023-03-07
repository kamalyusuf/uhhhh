import type { Transport } from "mediasoup-client/lib/types";
import { create } from "zustand";
import { combine, devtools } from "zustand/middleware";

export const useTransportStore = create(
  devtools(
    combine(
      {
        send_transport: null as Transport | null,
        receive_transport: null as Transport | null
      },
      (set) => ({
        setsendtransport: (send_transport: Transport | null) =>
          set({ send_transport }),

        setreceivetransport: (receive_transport: Transport | null) =>
          set({ receive_transport }),

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
    ),
    { name: "Transport" }
  )
);
