import {
  type Room as RoomType,
  RoomSpan,
  RoomStatus,
  RoomVisibility
} from "types";
import { MongooseProps } from "../../types/types";
import { HydratedDocument } from "mongoose";
import { ModelBuilder } from "../shared/model-builder";
import argon2 from "argon2";

export type RoomProps = Omit<MongooseProps<RoomType>, "members_count"> & {
  password?: string;
  span: RoomSpan;
};

export type RoomDoc = HydratedDocument<RoomProps>;

export interface RoomMethods {
  verifyPassword: (password: string) => Promise<boolean>;
}

const builder = new ModelBuilder<RoomProps, RoomMethods>();

const RoomSchema = builder.schema({
  name: {
    type: String,
    required: [true, "name is required"],
    trim: true
  },
  creator: {
    _id: {
      type: String,
      required: [true, "creator's id is required"]
    },
    display_name: {
      type: String,
      required: [true, "creator's display name is required"]
    }
  },
  status: {
    type: String,
    required: [true, "status is required"],
    enum: Object.values(RoomStatus)
  },
  visibility: {
    type: String,
    required: [true, "visibility is required"],
    enum: Object.values(RoomVisibility),
    index: true
  },
  description: {
    type: String,
    required: [true, "description is required"],
    trim: true
  },
  password: {
    type: String,
    required: [
      function () {
        // @ts-ignore
        return (this as RoomDoc).status === RoomStatus.PROTECTED;
      },
      "password is required if status is protected"
    ]
  },
  span: {
    type: String,
    required: [true, "span is required"],
    enum: Object.values(RoomSpan),
    default: RoomSpan.TEMPORARY
  }
});

RoomSchema.methods = {
  verifyPassword: function (password: string) {
    return argon2.verify(
      (this as unknown as RoomDoc).get("password") || "",
      password
    );
  }
};

export const Room = builder.model("Room", RoomSchema, "rooms");
