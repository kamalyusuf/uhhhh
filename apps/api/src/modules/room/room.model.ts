import {
  createSchema,
  Type,
  typedModel,
  ExtractDoc,
  ExtractProps
} from "ts-mongoose";
import { createSchemaOptions } from "../shared/utils";
import { RoomVisibility } from "types";

type Timestamp = {
  created_at: Date;
  updated_at: Date;
};

export type RoomDoc = ExtractDoc<typeof RoomSchema> & Timestamp;
export type RoomProps = ExtractProps<typeof RoomSchema> & Timestamp;

const visibility = Object.values(RoomVisibility) as Readonly<RoomVisibility[]>;

const RoomSchema = createSchema(
  {
    name: Type.string({
      required: [true, "room name is required"] as any,
      trim: true
    }),
    description: Type.string({
      required: [true, "room description is required"] as any,
      trim: true
    }),
    visibility: Type.string({
      required: [true, "room visibility is required"] as any,
      enum: visibility,
      index: true
    })
  },
  createSchemaOptions({ collection: "rooms" })
);

export const Room = typedModel("Room", RoomSchema);
