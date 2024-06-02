import { create } from "zustand";
import { combine, devtools } from "zustand/middleware";
import { nanoid } from "nanoid";
import type { User } from "types";
import joi from "joi";

const schema = joi.object<User, true>({
  _id: joi.string(),
  display_name: joi.string()
});

const initial = (): User | null => {
  const remember =
    typeof localStorage !== "undefined" && localStorage.getItem("remember me");
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
};

export const useUserStore = create(
  devtools(
    combine(
      {
        user: initial() as User | null
      },
      (set) => ({
        load: (display_name: string, remember: boolean) =>
          set(() => {
            const user = { _id: nanoid(24), display_name };

            if (remember) {
              localStorage.setItem("remember me", JSON.stringify(true));
              localStorage.setItem("user", JSON.stringify(user));
            }

            return { user };
          }),

        update: (display_name: string, remember: boolean) =>
          set((state) => {
            if (!state.user) throw new Error("thou shalt not");

            const user = { _id: state.user._id, display_name };

            localStorage.setItem("remember me", JSON.stringify(remember));

            if (remember) localStorage.setItem("user", JSON.stringify(user));
            else localStorage.removeItem("user");

            return { user };
          })
      })
    ),
    { name: "User" }
  )
);
