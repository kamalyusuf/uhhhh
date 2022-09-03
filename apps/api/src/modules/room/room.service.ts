import type { Id } from "../../types/types";
import { RoomRepository } from "./room.repository";
import { NotFoundError } from "@kamalyb/errors";
import { env } from "../../lib/env";
import { RoomVisibility, User, RoomSpan, RoomStatus } from "types";
import argon2 from "argon2";

export class RoomService {
  constructor(private readonly repo: RoomRepository) {}

  async create({
    name,
    description,
    visibility,
    creator,
    span = RoomSpan.TEMPORARY,
    password
  }: {
    name: string;
    description: string;
    visibility: RoomVisibility;
    creator: User;
    span?: RoomSpan;
    password?: string;
  }) {
    return this.repo.create({
      name,
      description,
      visibility,
      creator,
      span,
      status: password ? RoomStatus.PROTECTED : RoomStatus.UNPROTECTED,
      password: password ? await argon2.hash(password) : undefined
    });
  }

  async find() {
    return this.repo.find(
      {
        visibility: {
          $eq: RoomVisibility.PUBLIC
        }
      },
      {
        options: {
          sort: {
            created_at: -1
          },
          lean: true
        }
      }
    );
  }

  async findById(_id: Id) {
    const room = await this.repo.findById(_id);

    if (!room) throw new NotFoundError("no room found");

    return room;
  }

  async delete(_id: Id): Promise<boolean> {
    let room;

    try {
      room = await this.findById(_id);
    } catch (e) {
      return false;
    }

    if (
      !room ||
      (env.isDevelopment && room?.name === "akatsuki") ||
      room?.span === RoomSpan.PERMANENT
    )
      return false;

    await room.remove();

    return true;
  }
}
