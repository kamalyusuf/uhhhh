import { Router } from "express";
import { Room } from "./room.model.js";

export const router = Router();

router.get("/:id", (req, res) => {
  res.json(Room.findbyidorfail(req.params.id).json());
});
