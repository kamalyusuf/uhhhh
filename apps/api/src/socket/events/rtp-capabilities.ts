import { Event } from "../types";

const handler: Event<"rtp capabilities"> = {
  on: "rtp capabilities",
  invoke: async ({ cb }) => {
    cb({
      rtp_capabilities: {
        as: "uchiha madara",
        when: Date.now(),
        why: "am i getting this response"
      }
    } as any);
  }
};

export default handler;
