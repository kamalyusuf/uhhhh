import type { Event, EventPayload } from "../types";

export const handler: Event<"update display name"> = {
  on: "update display name",
  schema: (s) =>
    s.object<EventPayload<"update display name">>({
      new_display_name: s.string().min(2)
    }),
  invoke: ({ peer, payload }) => {
    peer.user.display_name = payload.new_display_name;
  }
};
