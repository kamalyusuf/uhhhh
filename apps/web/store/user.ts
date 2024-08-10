import { nanoid } from "nanoid";
import type { User } from "types";
import joi from "joi";
import { createstore } from "../utils/store";

export const REMEMBER_ME_KEY = "remember me";

interface UserStore {
  user: User | null;
  load: (display_name: string, remember: boolean) => void;
  update: (display_name: string, remember: boolean) => void;
}

const schema = joi.object<User, true>({
  _id: joi.string(),
  display_name: joi.string()
});

export const useUserStore = createstore<UserStore>("User", (set) => ({
  user: initial(),

  load: (display_name, remember) =>
    set(() => {
      const user = { _id: nanoid(24), display_name };

      if (remember) {
        localStorage.setItem(REMEMBER_ME_KEY, JSON.stringify(true));
        localStorage.setItem("user", JSON.stringify(user));
      }

      return { user };
    }),

  update: (display_name, remember) =>
    set((state) => {
      if (!state.user) throw new Error("thou shalt not");

      const user = { _id: state.user._id, display_name };

      localStorage.setItem(REMEMBER_ME_KEY, JSON.stringify(remember));

      if (remember) localStorage.setItem("user", JSON.stringify(user));
      else localStorage.removeItem("user");

      return { user };
    })
}));

function initial(): User | null {
  const remember =
    typeof localStorage !== "undefined" &&
    localStorage.getItem(REMEMBER_ME_KEY);
  const who =
    typeof localStorage !== "undefined" && localStorage.getItem("user");

  if (remember === "true" && who) {
    let user: User | null = null;

    try {
      user = JSON.parse(who);
    } catch (e) {}

    if (!user) return null;

    const { error } = schema.validate(user);

    if (error) return null;

    return user as User;
  } else return null;
}
