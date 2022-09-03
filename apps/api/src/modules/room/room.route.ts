import { Router } from "express";
import { ValidationError } from "@kamalyb/errors";
import { isValidObjectId } from "../../utils/mongo";

export const router = Router();

router.get("/:id", async (req, res) => {
  const id = req.params.id;

  if (!isValidObjectId(id))
    throw new ValidationError({ message: "invalid id" });

  const room = await deps.room.findById(id);

  res.send(room);
});
