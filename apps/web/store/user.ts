import { createstore } from "../utils/store";
import type { User } from "types";

export const REMEMBER_ME_KEY = "remember me";

const ME_KEY = "@me";

interface UserStore {
  user: User | null;
  load: (display_name: string, remember: boolean) => void;
  update: (display_name: string, remember: boolean) => void;
}

export const useUserStore = createstore<UserStore>("User", (set) => ({
  user: initial(),

  load: (display_name, remember) =>
    set(() => {
      const user = { _id: crypto.randomUUID().replace(/-/g, ""), display_name };

      if (remember) {
        localStorage.setItem(REMEMBER_ME_KEY, JSON.stringify(true));
        localStorage.setItem(ME_KEY, JSON.stringify(user));
      }

      return { user };
    }),

  update: (display_name, remember) =>
    set((state) => {
      if (!state.user) throw new Error("thou shalt not");

      const user = { _id: state.user._id, display_name };

      localStorage.setItem(REMEMBER_ME_KEY, JSON.stringify(remember));

      if (remember) localStorage.setItem(ME_KEY, JSON.stringify(user));
      else localStorage.removeItem(ME_KEY);

      return { user };
    })
}));

function initial(): User | null {
  const remember =
    typeof localStorage !== "undefined" &&
    localStorage.getItem(REMEMBER_ME_KEY);
  const raw =
    typeof localStorage !== "undefined" && localStorage.getItem(ME_KEY);

  if (remember === "true" && raw) {
    let user: User | null = null;

    try {
      user = JSON.parse(raw);
    } catch (e) {}

    return user;
  } else return null;
}
