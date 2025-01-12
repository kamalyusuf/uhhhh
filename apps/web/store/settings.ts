import { createstore, type Set } from "../utils/store";

interface SettingsStore {
  auto_join_room: boolean;
  notify_on_join: boolean;
  message_timestamp: boolean;
  set: Set<SettingsStore>;
}

export const useSettingsStore = createstore<SettingsStore>(
  "Settings",
  (set) => ({
    auto_join_room: true,
    notify_on_join: true,
    message_timestamp: true,
    set
  }),
  { persist: true }
);
