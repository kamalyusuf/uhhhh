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
  let attempts = 1;

  await retry(
    async () => {
      await mongoose.connect(url);

      logger.info(`mongodb connected on '${mongoose.connection.host}'`);
    },
    {
      maxAttempts: maxattempts,
      factor: 2,
      jitter: true,
      delay: 200,
      maxDelay: 2000,
      handleError: (error: Error, ctx) => {
        attempts += 1;

        const done = ctx.attemptsRemaining === 0;

        if (done) throw error;
        else
          logger.warn(
            `mongodb connection failed. re-attempting connection. attempt ${attempts} / ${maxattempts}. reason: ${error.message}`
          );
      }
    }
  );
};

export const mongo = { connect };
