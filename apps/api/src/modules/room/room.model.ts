import argon2 from "argon2";
import mongoose from "mongoose";
import { RoomStatus, RoomVisibility } from "types";
import { env } from "../../lib/env";

export interface RoomProps {
  _id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
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
  ispublic: () => boolean;
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
      required: true,
      trim: true
    },
    creator: {
      _id: {
        type: mongoose.Schema.Types.String,
        required: true
      },
      display_name: {
        type: mongoose.Schema.Types.String,
        required: true
      }
    },
    visibility: {
      type: mongoose.Schema.Types.String,
      required: true,
      enum: Object.values(RoomVisibility),
      index: true
    },
    description: {
      type: mongoose.Schema.Types.String,
      trim: true,
      maxlength: 140
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
  },

  ispublic() {
    return (this as RoomDocument).visibility === RoomVisibility.PUBLIC;
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
  const doc = asdoc(this);

  if (!this.isModified("password")) return next();

  if (doc.password) this.set({ password: await argon2.hash(doc.password) });

  next();
});

schema.virtual("status").get(function () {
  const doc = asdoc(this);

  return doc.password ? RoomStatus.PROTECTED : RoomStatus.UNPROTECTED;
});

function asdoc(t: unknown) {
  return t as RoomDocument;
}

export const Room = mongoose.model("Room", schema);
