import create from "zustand";
import { combine, devtools } from "zustand/middleware";
import { nanoid } from "nanoid";
import type { User } from "types";
import Joi from "joi";

const schema = Joi.object<User, true>({
  _id: Joi.string(),
  display_name: Joi.string()
});

const initial = (): User | null => {
  const remember =
    typeof localStorage !== "undefined" && localStorage.getItem("remember me");
  const who = typeof localStorage !== "undefined" && localStorage.getItem("me");

  if (remember === "true" && who) {
    let me: User;

    try {
      me = JSON.parse(who);
    } catch (e) {}

    if (!me) return null;

    const { error } = schema.validate(me);

    if (error) return null;
    else return me as User;
  } else return null;
};

export const useMeStore = create(
  devtools(
    combine(
      {
        me: initial() as User | null
      },
      (set) => ({
        load: (display_name: string, remember: boolean) =>
          set((state) => {
            const me = { _id: nanoid(24), display_name };

            if (remember) {
              localStorage.setItem("remember me", JSON.stringify(true));
              localStorage.setItem("me", JSON.stringify(me));
            }

            return { me };
          }),

        update: (display_name: string, remember: boolean) =>
          set((state) => {
            const me = { _id: state.me._id, display_name };

            localStorage.setItem("remember me", JSON.stringify(remember));

            if (remember) localStorage.setItem("me", JSON.stringify(me));
            else localStorage.removeItem("me");

            return { me };
          })
      })
    ),
    { name: "MeStore" }
  )
);
