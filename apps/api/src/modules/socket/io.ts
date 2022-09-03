import { redis } from "../../lib/redis";
import { logger } from "../../lib/logger";
import { Server } from "node:http";
import { Server as SocketServer } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import type { ServerEvent, TypedIO, Payload, EventCb, E } from "./types";
import fs from "node:fs";
import path from "node:path";
import { Peer } from "../../mediasoup/peer";
import type { User } from "types";
import { onDisconnect } from "./events/disconnect";
import { env } from "../../lib/env";
import { authenticate, onError, validateArgs } from "./utils";

const exclude: string[] = ["disconnect"];

class SocketIO {
  private _io?: TypedIO;

  public events = new Map<ServerEvent, E>();

  initialize(server: Server) {
    this._io = new SocketServer(server, {
      cors: {
        origin: env.WEB_URL,
        credentials: true
      },
      serveClient: false,
      pingTimeout: 60000,
      pingInterval: 15000,
      path: "/ws",
      transports: ["websocket", "polling"]
    });

    this._io.adapter(createAdapter(redis.duplicate(), redis.duplicate()));

    const dir = path.resolve(__dirname, "events");
    const files = fs.readdirSync(dir);

    for (const file of files) {
      if (exclude.some((ex) => file.startsWith(ex))) continue;

      const handler = require(`./events/${file}`).handler as E;

      if (!handler) throw new Error(`no handler found for ${file}`.red);

      this.events.set(handler.on, handler);
    }

    this._io.use(authenticate);

    this._io.on("connection", (socket) => {
      const raw = socket.handshake.query.user as string;
      const user = JSON.parse(raw) as User;
      const peer = Peer.create({ user, socket });

      logger.cinfo(`peer ${peer.user.display_name} connected`);

      socket.join(peer.user._id);

      for (const event of this.events.values()) {
        socket.on(event.on, async (...args: any[]) => {
          if (!this._io) throw new Error("io is not initialized");

          let t;

          try {
            t = validateArgs(...args);

            await event.invoke({
              io: this._io,
              socket,
              payload: t.payload as Payload<ServerEvent>,
              cb: t.cb as EventCb<ServerEvent>,
              event: event.on,
              peer
            });
          } catch (e) {
            const error = e as Error;

            onError({ error, peer, socket, event });
          }
        });
      }

      socket.on("disconnect", onDisconnect({ peer }));
    });
  }
}

export const io = new SocketIO();
