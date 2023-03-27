import argon2 from "argon2";
import mongoose from "mongoose";
import { RoomStatus, RoomVisibility } from "types";
import { env } from "../../lib/env";

export interface RoomProps {
  _id: mongoose.Types.ObjectId;
  name: string;
  description: string;
  visibility: RoomVisibility;
  password?: string;
  created_at: Date;
  updated_at: Date;
  creator: {
    _id: string;
    display_name: string;
  };
}

export type RoomDocument = mongoose.HydratedDocument<
  RoomProps,
  Methods & Virtuals
>;

interface Methods {
  isprivate: () => boolean;
  verifypassword: (plain: string) => Promise<boolean>;
}

interface Statics {
  delete: (id: string | mongoose.Types.ObjectId) => Promise<boolean>;
}

interface Virtuals {
  status: RoomStatus;
}

const schema = new mongoose.Schema<
  RoomProps,
  {},
  Methods,
  {},
  Virtuals,
  Statics
>(
  {
    name: {
      type: mongoose.Schema.Types.String,
      required: [true, "name is required"],
      trim: true
    },
    creator: {
      _id: {
        type: mongoose.Schema.Types.String,
        required: [true, "creator's id is required"]
      },
      display_name: {
        type: mongoose.Schema.Types.String,
        required: [true, "creator's display name is required"]
      }
    },
    visibility: {
      type: mongoose.Schema.Types.String,
      required: [true, "visibility is required"],
      enum: Object.values(RoomVisibility),
      index: true
    },
    description: {
      type: mongoose.Schema.Types.String,
      required: [true, "description is required"],
      trim: true
    },
    password: {
      type: mongoose.Schema.Types.String,
      minlength: 5
    }
  },
  {
    id: false,
    versionKey: false,
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at"
    },
    toObject: {
      virtuals: true
    },
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        delete ret.password;
      }
    }
  }
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
    const room = await Room.findById(id);

    if (!room || (env.isDevelopment && room?.name === "test")) return false;

    await room.deleteOne();

    return true;
  }
};

schema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  if (this.password) this.set({ password: await argon2.hash(this.password) });

  next();
});

schema.virtual("status").get(function () {
  return this.password ? RoomStatus.PROTECTED : RoomStatus.UNPROTECTED;
});

export const Room = mongoose.model("Room", schema);
