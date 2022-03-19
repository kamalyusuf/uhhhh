import {
  createSchema,
  Type,
  typedModel,
  ExtractDoc,
  ExtractProps
} from "ts-mongoose";
import { createSchemaOptions } from "../shared/utils";
import { RoomVisibility, RoomSpan, RoomStatus } from "types";
import argon2 from "argon2";

type Timestamp = {
  created_at: Date;
  updated_at: Date;
};

export type RoomDoc = ExtractDoc<typeof RoomSchema> & Timestamp;
export type RoomProps = ExtractProps<typeof RoomSchema> & Timestamp;

const visibility = Object.values(RoomVisibility) as Readonly<RoomVisibility[]>;

const span = Object.values(RoomSpan) as Readonly<RoomSpan[]>;

const status = Object.values(RoomStatus) as Readonly<RoomStatus[]>;

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
    }),
    creator: Type.object({
      required: [true, "room creator is required"] as any
    }).of({
      _id: Type.string({
        required: [true, "room creator's id is required"] as any
      }),
      display_name: Type.string({
        required: [true, "room creator's display name is required"] as any
      })
    }),
    span: Type.string({
      required: [true, "room span is required"] as any,
      enum: span,
      default: RoomSpan.TEMPORARY
    }),
    status: Type.string({
      required: [true, "room status is required"] as any,
      enum: status
    }),
    password: Type.string({
      required: [
        function () {
          // @ts-ignore
          return this.status === RoomStatus.PROTECTED;
        },
        "room password is required if room status is protected"
      ] as any
    }),
    ...({} as {
      comparePassword: (password: string) => Promise<boolean>;
    })
  },
  createSchemaOptions({
    collection: "rooms",
    json_exclude_fields: ["span", "password"]
  })
);

RoomSchema.methods.comparePassword = async function (
  password: string
): Promise<boolean> {
  return argon2.verify(this.get("password") || "", password);
};

export const Room = typedModel("Room", RoomSchema);
