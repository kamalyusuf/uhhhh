import { RoomService } from "./room/room.service";
import { roomRepo } from "./room/room.repository";

export interface Deps {
  room: RoomService;
}

declare global {
  var deps: Deps;
}

const room = new RoomService(roomRepo);

const deps: Deps = {
  room
};

global.deps = deps;
