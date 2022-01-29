import create from "zustand";
import { combine, devtools } from "zustand/middleware";
import { Peer } from "../types";

const store = combine(
  {
    peers: [] as Peer[]
  },
  (set) => ({
    add: (peer: Peer) => set((state) => ({ peers: [...state.peers, peer] }))
  })
);

export const usePeerStore = create(devtools(store, { name: "PeerStore" }));
