import { NotFoundError, UnprocessableEntityError } from "@kamalyb/errors";
import { Router } from "express";
import { isvalidobjectid } from "../../utils/mongo";
import { Room } from "./room.model";

export const router = Router();

router.get("/:id", async (req, res) => {
  const id = req.params.id;

  if (!isvalidobjectid(id)) throw new UnprocessableEntityError("invalid id");

  const room = await Room.findById(id);

  if (!room) throw new NotFoundError("no room found");

  res.send(room);
});

// router.get("/", (_req, res) => {
//   const rooms = MediasoupRoom.find();

//   res.send(rooms);
// });
