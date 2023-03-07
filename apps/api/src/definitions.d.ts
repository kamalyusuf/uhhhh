declare global {
  namespace Express {
    type ObjectId = mongoose.Types.ObjectId;

    type Id = string | mongoose.Types.ObjectId;
  }
}
