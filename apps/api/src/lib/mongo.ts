import mongoose from "mongoose";
import { retry } from "@lifeomic/attempt";
import { logger } from "./logger";

mongoose.set("strict", "throw");
mongoose.set("strictQuery", "throw");
mongoose.set("sanitizeProjection", true);
mongoose.set("sanitizeFilter", true);
mongoose.set("strictPopulate", true);
mongoose.SchemaTypes.String.cast(false);
mongoose.SchemaTypes.Number.cast(false);
mongoose.SchemaTypes.Boolean.cast(false);

const maxattempts = 5;

const connect = async (url: string) => {
  await retry(
    async () => {
      await mongoose.connect(url, {
        serverSelectionTimeoutMS: 5000
      });

      logger.info(`mongoose connected on ${mongoose.connection.host}`);
    },
    {
      maxAttempts: maxattempts,
      factor: 2,
      jitter: true,
      delay: 200,
      maxDelay: 2000,
      handleError: (error: Error, ctx) => {
        const done = ctx.attemptsRemaining === 0;

        if (done) throw error;
        else
          logger.warn(
            `mongodb connection failed. re-attempting connection. attempt ${
              ctx.attemptNum + 1
            } / ${maxattempts}. [REASON]: ${error.message}`
          );
      }
    }
  );
};

export const mongo = { connect };
