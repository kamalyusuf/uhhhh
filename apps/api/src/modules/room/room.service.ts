import { RoomRepository, roomRepo } from "./room.repository";
import { Types } from "mongoose";
import { NotFoundError } from "@kamalyb/errors";

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

  async findById(id: Types.ObjectId) {
    const room = await this.roomRepo.findById(id);
    if (!room) {
      throw new NotFoundError("no room found");
    }

    return room;
  }
}

export const roomService = new RoomService(roomRepo);
