import "colors";
import { Server } from "http";
import { _app } from "./app";
import { workers } from "./mediasoup/workers";

let server: Server;

const bootstrap = async () => {
  await workers.run();
  server = await _app.serve();
};

bootstrap().catch((e) => {
  console.log("bootstrap.error", e);
  process.exit(1);
});
