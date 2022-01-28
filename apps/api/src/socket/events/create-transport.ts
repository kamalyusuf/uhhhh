import { Event } from "../types";

const handler: Event<"create transport"> = {
  on: "create transport",
  invoke: async ({ socket }) => {
    return {
      emit: "create transport",
      to: [socket.id],
      send: {
        transport: "transport" as any
      }
    };
  }
};

export default handler;
