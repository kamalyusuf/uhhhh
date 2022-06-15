import { Router } from "express";
import { isValidObjectId, toObjectId } from "../../utils/object-id";
import { ValidationError } from "@kamalyb/errors";

export const router = Router();

router.get("/:id", async (req, res) => {
  const id = req.params.id;

  if (!isValidObjectId(id))
    throw new ValidationError({ message: "invalid id" });

  const room = await deps.room.findById(toObjectId(id));

  res.send(room);
});
