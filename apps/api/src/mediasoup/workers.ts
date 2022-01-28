import * as mediasoup from "mediasoup";
import { config } from "./config";
import { Worker } from "mediasoup/node/lib/types";

class MediasoupWorkers {
  private workers: Worker[];
  private workerIdx = 0;

  constructor() {
    this.workers = [];
  }

  async run() {
    for (let i = 0; i < config.mediasoup.workers_count; i++) {
      const worker = await mediasoup.createWorker({
        logLevel: config.mediasoup.worker.log_level,
        logTags: config.mediasoup.worker.log_tags,
        rtcMinPort: config.mediasoup.worker.rtc_min_port,
        rtcMaxPort: config.mediasoup.worker.rtc_max_port
      });

      worker.on("died", () => {
        console.log("mediasoup worker died".red);
        setTimeout(() => {
          process.exit(1);
        }, 2000);
      });

      this.workers.push(worker);
    }
  }

  next(): Worker {
    if (this.workers.length === 0) {
      throw new Error("workers not running. call 'run()'");
    }

    const worker = this.workers[this.workerIdx];
    if (++this.workerIdx === this.workers.length) this.workerIdx = 0;

    return worker;
  }

  close(): void {
    for (const worker of this.workers) {
      worker.close();
    }

    this.workers = [];
  }
}

export const workers = new MediasoupWorkers();
