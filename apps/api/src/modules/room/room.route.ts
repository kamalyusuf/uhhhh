import { Router, Request, Response } from "express";
import { roomService } from "./room.service";
import { Types } from "mongoose";
import {
  useIsValidObjectId,
  useCheckValidationResult
} from "../../middlewares/validation";

export const router = Router();

router.get(
  "/:id",
  [useIsValidObjectId(), useCheckValidationResult],
  async (req: Request, res: Response) => {
    const room = await roomService.findById(new Types.ObjectId(req.params.id));
    res.send(room);
  }
);
