import { BaseRepository } from "../shared/base.repository";
import { RoomProps, Room, RoomMethods } from "./room.model";

export class RoomRepository extends BaseRepository<
  RoomProps,
  RoomMethods,
  {},
  {}
> {}

export const roomRepo = new RoomRepository(Room);
