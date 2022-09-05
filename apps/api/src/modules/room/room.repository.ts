import { BaseRepository } from "../shared/base.repository";
import { type RoomProps, Room, type RoomMethods } from "./room.model";

export class RoomRepository extends BaseRepository<
  RoomProps,
  RoomMethods,
  {},
  {}
> {}

export const roomRepo = new RoomRepository(Room);
