import type { Event } from "../types";

export const handler: Event<"update display name"> = {
  on: "update display name",
  invoke: ({ peer, data }) => {
    peer.user.display_name = data.new_display_name;
  }
};
