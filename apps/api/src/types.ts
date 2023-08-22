import { RoomProps, RoomVirtuals } from "./modules/room/room.model";
import { DbmEntity } from "mongoose-ts-builder";

export interface Dbm {
  Room: DbmEntity<"rooms", RoomProps, RoomVirtuals>;
}
