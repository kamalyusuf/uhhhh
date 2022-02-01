import { RoomRepository, roomRepo } from "./room.repository";
import { Types } from "mongoose";
import { NotFoundError } from "@kamalyb/errors";
import { io } from "../../socket/io";

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

  async deleteById(_id: Types.ObjectId) {
    await this.roomRepo.deleteOne({ _id: { $eq: _id } });
    io.get().emit("delete room", { room_id: _id.toString() });
  }
}

export const roomService = new RoomService(roomRepo);
