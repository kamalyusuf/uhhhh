import { NotFoundError, UnprocessableEntityError } from "@kamalyb/errors";
import { Router } from "express";
import { Room } from "./room.model";
import mongoose from "mongoose";

export const router = Router();

router.get("/:id", async (req, res) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id))
    throw new UnprocessableEntityError("invalid id");

  const room = await Room.findbyid(id);

  if (!room) throw new NotFoundError("room not found");

  res.json(room);
});
