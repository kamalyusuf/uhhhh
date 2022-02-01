import mongoose from "mongoose";
import { retry } from "@lifeomic/attempt";
import uniqueValidator from "mongoose-unique-validator";
import { logger } from "./logger";

mongoose.set("strict", "throw");
mongoose.set("strictQuery", "throw");
mongoose.set("sanitizeProjection", true);
// mongoose.set("sanitizeFilter", true);
mongoose.set("strictPopulate", true);
mongoose.plugin(uniqueValidator, { message: `{PATH} already exists` });
// TODO: cast() does not exist on type probably because of the v6 upgrade
// mongoose.SchemaTypes.String.cast(false);
// mongoose.SchemaTypes.Number.cast(false);
// mongoose.SchemaTypes.Boolean.cast(false);
// mongoose.Schema.Types.String.type(false);

export const connect = async (url: string) => {
  try {
    await retry(
      async () => {
        await mongoose.connect(url);

        logger.info(`mongo connected on '${mongoose.connection.host}'`.magenta);
      },
      {
        maxAttempts: 10,
        factor: 2,
        jitter: true,
        maxDelay: 2000,
        handleError: (error, _ctx) => {
          console.log("retry.error", error);
        }
      }
    );
  } catch (e) {
    throw e;
  }
};
