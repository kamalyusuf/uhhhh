import { ModelBuilder, ModelDocument, ModelProps } from "mongoose-ts-builder";
import { Dbm } from "../../types";
import mongoose from "mongoose";
import { RoomVisibility, RoomStatus } from "types";
import argon2 from "argon2";
import { env } from "../../lib/env";

export type RoomProps = ModelProps<{
  name: string;
  description?: string;
  visibility: RoomVisibility;
  password?: string;
  creator: {
    _id: string;
    display_name: string;
  };
}>;

export type RoomDocument = ModelDocument<RoomProps, Methods, RoomVirtuals>;

interface Methods {
  isprivate: () => boolean;
  ispublic: () => boolean;
  verifypassword: (plain: string) => Promise<boolean>;
}

interface Statics {
  delete: (id: string | mongoose.Types.ObjectId) => Promise<boolean>;
}

export interface RoomVirtuals {
  status: RoomStatus;
}

const builder = new ModelBuilder<
  Dbm,
  RoomProps,
  Methods,
  RoomVirtuals,
  Statics
>("Room", "rooms");

builder.defineschema(
  (t) => ({
    name: {
      type: t.String,
      required: true,
      trim: true
    },
    visibility: {
      type: t.String,
      required: true,
      enum: Object.values(RoomVisibility),
      index: true
    },
    description: {
      type: t.String,
      trim: true,
      maxlength: 140
    },
    password: {
      type: t.String,
      minlength: 5
    },
    creator: {
      _id: {
        type: t.String,
        required: true
      },
      display_name: {
        type: t.String,
        required: true
      }
    }
  }),
  { excludes: ["password"] }
);

builder.method("verifypassword", function (plain) {
  return argon2.verify(this.password ?? "", plain);
});

builder.method("isprivate", function () {
  return this.visibility === RoomVisibility.PRIVATE;
});

builder.method("ispublic", function () {
  return this.visibility === RoomVisibility.PUBLIC;
});

builder.static("delete", async function (id) {
  const room = await this.findbyid(id);

  if (!room || (env.isDevelopment && room?.name === "test")) return false;

  await room.deleteOne();

  return true;
});

builder.pre("save", async function (next) {
  if (this.password && this.isModified("password"))
    this.set({ password: await argon2.hash(this.password) });

  next();
});

builder.virtual("status", function () {
  return this.password ? RoomStatus.PROTECTED : RoomStatus.UNPROTECTED;
});

export const Room = builder.model();
