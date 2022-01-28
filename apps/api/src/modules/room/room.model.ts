import {
  createSchema,
  Type,
  typedModel,
  ExtractDoc,
  ExtractProps
} from "ts-mongoose";
import { createSchemaOptions } from "../shared/utils";

type Timestamp = {
  created_at: Date;
  updated_at: Date;
};

export type RoomDoc = ExtractDoc<typeof RoomSchema> & Timestamp;
export type RoomProps = ExtractProps<typeof RoomSchema> & Timestamp;

const RoomSchema = createSchema(
  {
    name: Type.string({
      required: [true, "room name is required"] as any,
      trim: true
    }),
    description: Type.string({
      required: [true, "room description is required"] as any,
      trim: true
    })
  },
  createSchemaOptions({ collection: "rooms" })
);

export const Room = typedModel("Room", RoomSchema);
