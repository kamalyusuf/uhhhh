import create from "zustand";
import { combine, devtools } from "zustand/middleware";
import { User } from "types";

const store = combine(
  {
    peers: {} as Record<string, User>
  },
  (set) => ({
    add: (peer: User) =>
      set((state) => {
        return {
          peers: {
            ...state.peers,
            [peer._id]: peer
          }
        };
      })
  })
);

export const usePeerStore = create(devtools(store, { name: "PeerStore" }));
