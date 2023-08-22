import { UnprocessableEntityError } from "@kamalyb/errors";
import { Router } from "express";
import { Room } from "./room.model";
import mongoose from "mongoose";

export const router = Router();

router.get("/:id", async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    throw new UnprocessableEntityError("invalid id");

  res.json(await Room.findbyidorfail(req.params.id));
});
