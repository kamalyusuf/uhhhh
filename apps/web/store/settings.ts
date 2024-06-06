import { create, type StoreApi } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface SettingsStore {
  auto_join_room: boolean;
  notify_on_join: boolean;
  set: StoreApi<Omit<SettingsStore, "set">>["setState"];
}

export const useSettingsStore = create<SettingsStore>()(
  devtools(
    persist(
      (set) => ({
        auto_join_room: true,
        notify_on_join: true,
        set
      }),
      { name: "SettingsStore" }
    ),
    { name: "Settings" }
  )
);
