import { roomService } from "../../modules/room/room.service";
import { Event } from "../types";

const handler: Event<"create room"> = {
  on: "create room",
  invoke: async ({ payload, cb, socket }) => {
    try {
      const room = await roomService.create(payload);
      cb({ room: room.toJSON() });
    } catch (e) {
      socket.emit("error", {
        event: "create room",
        message: (e as any).message
      });
    }
  }
};

export default handler;
