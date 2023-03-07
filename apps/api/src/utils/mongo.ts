import mongoose from "mongoose";

export const ismongoosedoc = (doc: unknown) => doc instanceof mongoose.Document;

export const isvalidobjectid = (str: string) =>
  mongoose.Types.ObjectId.isValid(str);

export const toobjectid = (str: string) => {
  if (!isvalidobjectid(str)) throw new Error("invalid id");

  return new mongoose.Types.ObjectId(str);
};
