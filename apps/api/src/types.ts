import { RoomProps, RoomVirtuals } from "./modules/room/room.model";

export interface Timestamp {
  created_at: Date;
  updated_at: Date;
}

export interface Dbm {
  Room: {
    collection: "rooms";
    props: RoomProps;
    virtuals: RoomVirtuals;
  };
}
