import type { CallbackEvent, EventPayload } from "../types.js";

export const handler: CallbackEvent<"update display name"> = {
  on: "update display name",
  schema: (s) =>
    s.object<EventPayload<"update display name">>({
      new_display_name: s.string().min(3)
    }),
  invoke: ({ peer, payload, cb }) => {
    peer.user.display_name = payload.new_display_name;

    cb({ ok: true, peer: peer.user });
  }
};
