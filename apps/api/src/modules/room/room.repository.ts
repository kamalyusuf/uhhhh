import { BaseRepository } from "../shared/base.repository";
import { RoomDoc, RoomProps, Room } from "./room.model";

export class RoomRepository extends BaseRepository<RoomDoc, RoomProps> {}

export const roomRepo = new RoomRepository(Room);
