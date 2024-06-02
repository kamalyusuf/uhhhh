import type { CallbackEvent, EventPayload } from "../types";

export const handler: CallbackEvent<"update display name"> = {
  on: "update display name",
  schema: (s) =>
    s
      .object<EventPayload<"update display name">>({
        new_display_name: s.string().min(3)
      })
      .messages({
        "string.min": "name must be at least 3 characters long"
      }),
  invoke: ({ peer, payload, cb }) => {
    peer.user.display_name = payload.new_display_name;

    cb({ ok: true, peer: peer.user });
  }
};
