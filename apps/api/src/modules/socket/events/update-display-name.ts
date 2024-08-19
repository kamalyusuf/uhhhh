import type { CallbackEvent } from "../types.js";

export const handler: CallbackEvent<"update display name"> = {
  on: "update display name",
  input: (s) => ({
    new_display_name: s.string().min(3)
  }),
  invoke: ({ peer, payload, cb }) => {
    peer.user.display_name = payload.new_display_name;

    cb({ ok: true, peer: peer.user });
  }
};
