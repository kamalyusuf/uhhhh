import { Router } from "express";

export const router = Router();

// router.get("/", async (_req, res) => {
//   const rooms = await deps.room.find();

//   res.send(rooms);
// });

// router.get("/:id", async (req, res) => {
//   const id = req.params.id;

//   if (!isValidObjectId(id))
//     throw new ValidationError({ message: "invalid id" });

//   const room = await deps.room.findById(id);

//   res.send(room);
// });
