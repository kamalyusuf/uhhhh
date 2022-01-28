import { Event } from "../types";

const handler: Event<"test"> = {
  on: "test",
  invoke: async ({ io, socket, payload }) => {
    return {
      emit: "test",
      to: [socket.id],
      send: {
        uchiha: "madara",
        at: Date.now()
      }
    };
  }
};

export default handler;
