import { RoomRepository, roomRepo } from "./room.repository";
import { Types } from "mongoose";
import { NotFoundError } from "@kamalyb/errors";
import { env } from "../../lib/env";

export class RoomService {
  constructor(private readonly roomRepo: RoomRepository) {}

  async create({ name, description }: { name: string; description: string }) {
    return this.roomRepo.createOne({
      name,
      description
    });
  }

  async find() {
    return this.roomRepo.find(
      {},
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
