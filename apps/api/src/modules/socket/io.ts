import { logger } from "../../lib/logger";
import { Server } from "node:http";
import { Server as SocketServer } from "socket.io";
import type { ServerEvent, TypedIO, EventData, EventCb, E } from "./types";
import fs from "node:fs";
import path from "node:path";
import { Peer } from "../mediasoup/peer";
import type { User } from "types";
import { ondisconnect } from "./events/disconnect";
import { env } from "../../lib/env";
import { authenticate, onerror, validateargs } from "./utils";

class SocketIO {
  private io?: TypedIO;

  public events = new Map<ServerEvent, E>();

  initialize(server: Server) {
    this.io = new SocketServer(server, {
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

    this.loadevents();

    this.io.use(authenticate);

    this.io.on("connection", (socket) => {
      const raw = socket.handshake.query.user as string;
      const user = JSON.parse(raw) as User;
      const peer = Peer.create({ user, socket });

      logger.cinfo(`peer ${peer.user.display_name} connected`);

      socket.join(peer.user._id);

      for (const event of this.events.values()) {
        socket.on(event.on, async (...args: unknown[]) => {
          if (!this.io) throw new Error("io not initialized");

          let t,
            __request__: boolean | undefined = false;

          try {
            t = validateargs(...args);

            __request__ = t.__request__;

            await event.invoke({
              io: this.io,
              socket,
              data: t.eventdata as EventData<ServerEvent>,
              cb: t.cb as EventCb<ServerEvent>,
              event: event.on,
              peer
            });
          } catch (e) {
            const error = e as Error;

            onerror({ error, peer, socket, event, __request__ });
          }
        });
      }

      socket.on("disconnect", ondisconnect(peer));
    });
  }

  private loadevents() {
    const exclude: string[] = ["disconnect"];

    const dir = path.resolve(__dirname, "events");
    const files = fs.readdirSync(dir);

    for (const file of files) {
      if (exclude.some((ex) => file.startsWith(ex))) continue;

      const handler = require(`./events/${file}`).handler as E;

      if (!handler) throw new Error(`no handler found for ${file}`.red);

      this.events.set(handler.on, handler);
    }
  }
}

export const io = new SocketIO();
