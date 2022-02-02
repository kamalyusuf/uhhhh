import { Event } from "../types";

const handler: Event<"update display name"> = {
  on: "update display name",
  invoke: ({ peer, payload }) => {
    peer.user.display_name = payload.new_display_name;
  }
};

export default handler;
