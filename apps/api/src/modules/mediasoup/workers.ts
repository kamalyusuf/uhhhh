import * as mediasoup from "mediasoup";
import { Worker } from "mediasoup/node/lib/types";
import os from "node:os";
import { logger } from "../../lib/logger";
import { env } from "../../lib/env";

class MediasoupWorkers {
  private workers: Worker[];

  private worker_idx = 0;

  constructor() {
    this.workers = [];
  }

  async run() {
    for (let i = 0; i < Object.keys(os.cpus()).length; i++) {
      const worker = await mediasoup.createWorker({
        logLevel: "warn",
        logTags: [
          "info",
          "ice",
          "dtls",
          "rtp",
          "srtp",
          "rtcp",
          "rtx",
          "bwe",
          "score",
          "simulcast",
          "svc",
          "sctp"
        ],
        rtcMinPort: env.MEDIASOUP_MIN_PORT,
        rtcMaxPort: env.MEDIASOUP_MAX_PORT
      });

      worker.on("died", (error) => {
        logger.error(`mediasoup worker died. reason: ${error.message}`, error);

        setTimeout(() => {
          process.exit(1);
        }, 2000);
      });

      this.workers.push(worker);
    }
  }

  next() {
    if (this.workers.length === 0) throw new Error("workers not running");

    const worker = this.workers[this.worker_idx];
    if (++this.worker_idx === this.workers.length) this.worker_idx = 0;

    return worker;
  }

  close() {
    for (const worker of this.workers) worker.close();

    this.workers = [];
  }
}

export const workers = new MediasoupWorkers();
