import mongoose from "mongoose";

export type MongooseProps<
  Props extends {
    _id: string;
    created_at: string;
    updated_at: string;
  }
> = Omit<Props, "_id" | "created_at" | "updated_at"> &
  Timestamp & {
    _id: mongoose.Types.ObjectId;
  };

export interface Timestamp {
  created_at: Date;
  updated_at: Date;
}

export type MongooseSchemaProps<T> = Omit<
  T,
  "_id" | "created_at" | "updated_at"
>;
