import { Router } from "express";
import { Room } from "./room.model";

export const router = Router();

router.get("/:id", async (req, res) => {
  res.json(Room.findbyidorfail(req.params.id).json());
});
