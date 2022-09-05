import { UnprocessableEntityError } from "@kamalyb/errors";
import { Router } from "express";
import { isValidObjectId } from "../../utils/mongo";

export const router = Router();

// router.get("/ms", (_req, res) => {
//   const rooms = MediasoupRoom.find();

//   res.send(rooms);
// });

router.get("/:id", async (req, res) => {
  const id = req.params.id;

  if (!isValidObjectId(id)) throw new UnprocessableEntityError("invalid id");

  const room = await deps.room.findById(id);

  res.send(room);
});
