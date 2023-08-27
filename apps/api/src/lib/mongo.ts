import mongoose from "mongoose";
import { retry } from "@lifeomic/attempt";
import { logger } from "./logger";
import paginate from "mongoose-paginate-v2";
import { env } from "./env";

mongoose.set("strict", "throw");
mongoose.set("strictQuery", "throw");
mongoose.set("sanitizeProjection", true);
mongoose.set("sanitizeFilter", true);
mongoose.set("strictPopulate", true);

mongoose.plugin(paginate);

const maxattempts = 5;

const connect = async () => {
  await retry(
    async () => {
      await mongoose.connect(env.MONGO_URL, {
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

paginate.paginate.options = {
  customLabels: {
    hasNextPage: "has_next_page",
    hasPrevPage: "has_prev_page",
    nextPage: "next_page",
    prevPage: "prev_page",
    totalDocs: "total_docs",
    totalPages: "total_pages",
    pagingCounter: "paging_counter"
  }
};
