import { RoomRepository, roomRepo } from "./room.repository";
import { Types } from "mongoose";
import { NotFoundError } from "@kamalyb/errors";
import { env } from "../../lib/env";
import { RoomVisibility } from "types";

export class RoomService {
  constructor(private readonly roomRepo: RoomRepository) {}

  async create({
    name,
    description,
    visibility
  }: {
    name: string;
    description: string;
    visibility: RoomVisibility;
  }) {
    return this.roomRepo.createOne({
      name,
      description,
      visibility
    });
  }

  async find() {
    return this.roomRepo.find(
      {
        visibility: {
          $eq: RoomVisibility.PUBLIC
        }
      },
      {
        sort: {
          created_at: -1
        },
        lean: true
      }
    );
  }

  async findById(_id: Types.ObjectId) {
    const room = await this.roomRepo.findById(_id);
    if (!room) {
      throw new NotFoundError("no room found");
    }

    return room;
  }

  async _delete(_id: Types.ObjectId): Promise<boolean> {
    let room;

    try {
      room = await this.findById(_id);
    } catch (e) {
      return false;
    }

    if (!room || (env.isDevelopment && room?.name === "akatsuki")) {
      return false;
    }

    await room.remove();

    return true;
  }
}

export const roomService = new RoomService(roomRepo);
