import { createstore } from "../utils/store";
import { produce } from "immer";
import type { User } from "types";

interface PeerStore {
  peers: Record<string, User>;
  add: (peer: User) => void;
  remove: (peer_id: string) => void;
  reset: () => void;
}

export const usePeerStore = createstore<PeerStore>("Peer", (set) => ({
  peers: {},
  add: (peer) =>
    set((state) => {
      return {
        peers: {
          ...state.peers,
          [peer._id]: peer
        }
      };
    }),

  remove: (peer_id) =>
    set((state) =>
      produce(state, (draft) => {
        delete draft.peers[peer_id];
      })
    ),

  reset: () => set({ peers: {} })
}));
