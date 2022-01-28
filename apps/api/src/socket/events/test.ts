import { Event } from "../types";

const handler: Event<"test"> = {
  on: "test",
  invoke: async ({ io, socket, payload, event, cb, req }) => {
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
