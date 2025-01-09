import { createstore } from "../utils/store";

interface RoomChatDrawer {
  opened: boolean;
  unread: boolean;
  open: () => void;
  close: () => void;
  setunread: (value: boolean) => void;
}

export const useRoomChatDrawer = createstore<RoomChatDrawer>(
  "RoomChatDrawer",
  (set) => ({
    opened: false,
    unread: false,
    open: () => {
      set((state) => {
        return { opened: true, ...(state.unread && { unread: false }) };
      });
    },
    close: () => {
      set({ opened: false });
    },
    setunread: (unread) => set({ unread })
  })
);
