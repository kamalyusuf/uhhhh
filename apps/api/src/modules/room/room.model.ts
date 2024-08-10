import { RoomVisibility, RoomStatus } from "types";
import type { Room as RoomType, User } from "types";
import { randomUUID } from "node:crypto";
import argon2 from "argon2";
import { env } from "../../lib/env.js";
import type { EventPayload } from "../socket/types.js";
import { BadRequestError, NotFoundError } from "@kamalyb/errors";

export class Room {
  static rooms = new Map<string, Room>();

  public readonly _id: string;

  public name: string;

  public description?: string;

  public creator: User;

  public created_at: Date;

  public updated_at: Date;

  public visibility: RoomVisibility;

  public password?: string;

  private constructor({
    name,
    visibility,
    description,
    password,
    creator
  }: EventPayload<"create room"> & { creator: User }) {
    this._id = randomUUID();

    this.name = name;

    this.visibility = visibility;

    this.description = description;

    this.password = password;

    this.created_at = this.updated_at = new Date();

    this.creator = creator;
  }

  static async create(
    payload: EventPayload<"create room"> & { creator: User }
  ) {
    if (payload.password)
      payload.password = await argon2.hash(payload.password);

    const room = new Room(payload);

    Room.rooms.set(room._id, room);

    return room;
  }

  static find() {
    return Array.from(Room.rooms.values())
      .filter((room) => room.visibility === RoomVisibility.PUBLIC)
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
  }

  static findbyidorfail(id: string) {
    const room = Room.rooms.get(id);

    if (!room) throw new NotFoundError("room not found");

    return room;
  }

  static delete(id: string) {
    const room = Room.rooms.get(id);

    if (!room || (env.isDevelopment && room?.name === "test")) return false;

    Room.rooms.delete(room._id);

    return true;
  }

  get status(): RoomStatus {
    return this.password ? RoomStatus.PROTECTED : RoomStatus.UNPROTECTED;
  }

  json(): Omit<RoomType, "members_count"> {
    return {
      _id: this._id,
      name: this.name,
      description: this.description,
      created_at: this.created_at.toISOString(),
      updated_at: this.updated_at.toISOString(),
      visibility: this.visibility,
      creator: this.creator,
      status: this.status
    };
  }

  verifypassword(plain: string): Promise<boolean> {
    if (!this.password)
      throw new BadRequestError("room is not password protected");

    return argon2.verify(this.password, plain);
  }

  isprivate() {
    return this.visibility === RoomVisibility.PRIVATE;
  }

  ispublic() {
    return this.visibility === RoomVisibility.PUBLIC;
  }
}
