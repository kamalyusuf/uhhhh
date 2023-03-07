import { Server } from "http";

export const exithandler = (server?: Server) => {
  if (server)
    server.close(() => {
      process.exit(1);
    });
  else process.exit(1);
};
