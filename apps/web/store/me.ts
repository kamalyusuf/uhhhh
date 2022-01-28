import create from "zustand";
import { combine, devtools } from "zustand/middleware";
import { nanoid } from "nanoid";
import { User } from "types";
import { z } from "zod";

const schema = z.object({
  _id: z.string(),
  display_name: z.string()
});

const initial = (): User | null => {
  const remember =
    typeof localStorage !== "undefined" && localStorage.getItem("remember me");
  const who = typeof localStorage !== "undefined" && localStorage.getItem("me");

  if (remember === "true" && who) {
    const me = JSON.parse(who);
    const { success } = schema.safeParse(me);
    if (success) {
      return me as User;
    } else {
      return null;
    }
  } else {
    return null;
  }
};

const store = combine(
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
      })
  })
);

export const useMeStore = create(devtools(store, { name: "MeStore" }));
