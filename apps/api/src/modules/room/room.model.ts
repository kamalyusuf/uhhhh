import { type Room as IRoom, RoomStatus, RoomVisibility } from "types";
import type { MongooseProps } from "../../types/types";
import { Types, type HydratedDocument } from "mongoose";
import { ModelBuilder } from "../shared/model-builder";
import argon2 from "argon2";
import { env } from "../../lib/env";

export type RoomProps = Omit<MongooseProps<IRoom>, "members_count"> & {
  password?: string;
};

export type RoomDocument = HydratedDocument<RoomProps, RoomMethods>;

interface RoomMethods {
  isprivate: () => boolean;
  verifypassword: (plain: string) => Promise<boolean>;
}

interface RoomStatics {
  delete: (id: string | Types.ObjectId) => Promise<boolean>;
}

const builder = new ModelBuilder<RoomProps, RoomMethods, {}, RoomStatics>(
  "User",
  "users"
);

const schema = builder.schema(
  (t) => ({
    name: {
      type: t.String,
      required: [true, "name is required"],
      trim: true
    },
    creator: {
      _id: {
        type: t.String,
        required: [true, "creator's id is required"]
      },
      display_name: {
        type: t.String,
        required: [true, "creator's display name is required"]
      }
    },
    status: {
      type: t.String,
      required: [true, "status is required"],
      enum: Object.values(RoomStatus)
    },
    visibility: {
      type: t.String,
      required: [true, "visibility is required"],
      enum: Object.values(RoomVisibility),
      index: true
    },
    description: {
      type: t.String,
      required: [true, "description is required"],
      trim: true
    },
    password: {
      type: t.String,
      required: [
        function () {
          // @ts-ignore
          const room = this as RoomDocument;

          return room.status === RoomStatus.PROTECTED;
        },
        "password is required if status is protected"
      ]
    }
  }),
  { to_json_exclude: ["password"] }
);

schema.methods = {
  verifypassword(plain) {
    return argon2.verify((this as RoomDocument).get("password"), plain);
  },

  isprivate() {
    return (this as RoomDocument).visibility === RoomVisibility.PRIVATE;
  }
};

schema.statics = {
  async delete(id) {
    let room;

    try {
      room = await Room.findById(id);
    } catch (e) {
      return false;
    }

    if (!room || (env.isDevelopment && room?.name === "test")) return false;

    await room.deleteOne();

    return true;
  }
};

schema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  if (!this.password)
    throw new Error(`password not set for ${JSON.stringify(this.toJSON())}`);

  this.set({ password: await argon2.hash(this.password) });

  next();
});

export const Room = builder.model();
