import * as mediasoup from "mediasoup";
import { Worker } from "mediasoup/node/lib/types";
import os from "os";

class MediasoupWorkers {
  private workers: Worker[];
  private workerIdx = 0;

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
        rtcMinPort: 10000,
        rtcMaxPort: 10100
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
