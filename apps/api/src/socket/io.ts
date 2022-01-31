import { logger } from "../lib/logger";
import { env } from "../lib/env";
import { Server } from "http";
import { Server as SocketServer } from "socket.io";
import { ServerEvent, TypedIO, Event, ClientEvent } from "./types";
import fs from "fs";
import path from "path";
import { EventError } from "../lib/socket-error";
import { Request } from "express";
import { NotAuthorizedError } from "@kamalyb/errors";
import { Peer } from "../mediasoup/peer";
import { z } from "zod";
import { User } from "types";
import { onDisconnect } from "./events/disconnect";

const schema = z.object({
  _id: z.string(),
  display_name: z.string()
});

const exclude: Readonly<ClientEvent[]> = [
  "active speaker",
  "consumer consumed"
];

class SocketIO {
  private _io?: TypedIO;
  public events = new Map<ServerEvent, Event<ServerEvent>>();

  get() {
    if (!this._io) {
      throw new Error("io is not initialized");
    }

    return this._io;
  }

  init(server: Server) {
    this._io = new SocketServer(server, {
      cors: {
        origin: [env.WEB_URL],
        credentials: true
      },
      serveClient: false,
      pingTimeout: 60000,
      pingInterval: 15000,
      path: "/ws"
    });

    const dir = path.resolve(__dirname, "events");
    const files = fs.readdirSync(dir);

    for (const file of files) {
      if (file === "disconnect.ts") {
        continue;
      }

      const handler = require(`./events/${file}`).default;
      this.events.set(handler.on, handler);
    }

    this._io.use((socket, next) => {
      const raw = socket.handshake.query.user;
      if (!raw || typeof raw !== "string") {
        return next(new NotAuthorizedError());
      }

      let parsed;

      try {
        parsed = JSON.parse(raw);
      } catch (e) {}

      if (!parsed) {
        return next(new NotAuthorizedError());
      }

      const { success } = schema.safeParse(parsed);
      if (!success) {
        return next(new NotAuthorizedError());
      }

      next();
    });

    this._io.on("connection", (socket) => {
      const raw = socket.handshake.query.user as string;
      const user = JSON.parse(raw) as User;
      const peer = Peer.create({ user });

      logger.log({
        level: "info",
        dev: true,
        message: `peer ${peer.user.display_name} connected`.cyan
      });

      socket.join(peer.user._id);

      for (const event of this.events.values()) {
        socket.on(event.on, async (data: any, cb: any) => {
          if (!this._io) {
            throw new Error("io is not initialized");
          }

          if (typeof data !== "object" || Array.isArray(data)) {
            return socket.emit("error", {
              message: "expected data to be an object"
            });
          }

          if (!exclude.includes(event.on) && typeof cb !== "function") {
            return socket.emit("error", {
              message: "expected callback to be a function"
            });
          }

          try {
            const action = await event.invoke({
              io: this._io,
              socket,
              payload: data,
              cb,
              event: event.on,
              req: socket.request as Request,
              peer
            });

            if (action) {
              this._io.to(action.to).emit(action.emit, action.send as any);
            }
          } catch (e: any) {
            logger.log({
              level: "error",
              dev: true,
              message: `[${event.on}] ${e.message}`
            });
            socket.emit("event error", new EventError(event.on, e));
          }
        });
      }

      logger.log({
        level: "info",
        dev: true,
        message: `${peer.user.display_name}'s listening events: '${socket
          .eventNames()
          .join(", ")}'`
      });

      socket.on("disconnect", onDisconnect({ io: this._io!, socket, peer }));
    });
  }
}

export const io = new SocketIO();
