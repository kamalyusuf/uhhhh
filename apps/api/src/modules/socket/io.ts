import consola from "consola";
import fs from "node:fs";
import path from "node:path";
import { Server as SocketServer } from "socket.io";
import { Peer } from "../mediasoup/peer.js";
import { ondisconnect } from "./events/disconnect.js";
import { env } from "../../lib/env.js";
import { authenticate, onerror, validateargs } from "./utils.js";
import { s } from "../../utils/schema.js";
import type { Server } from "node:http";
import type { User } from "types";
import type {
  ServerEvent,
  TypedIO,
  EventPayload,
  EventCb,
  E
} from "./types.js";

class SocketIO {
  private io?: TypedIO;

  public events = new Map<ServerEvent, E>();

  async initialize(server: Server) {
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

    await this.loadevents();

    this.io.use(authenticate);

    this.io.on("connection", (socket) => {
      const raw = socket.handshake.query["@me"] as string;
      const user = JSON.parse(raw) as User;
      const peer = Peer.create({ user, socket });

      if (env.isDevelopment)
        consola.info(`peer ${peer.user.display_name} connected`);

      socket.join(peer.user._id);

      for (const event of this.events.values()) {
        socket.on(event.on, async (...args: unknown[]) => {
          if (!this.io) throw new Error("io not initialized");

          let t,
            __request__: boolean | undefined = false;

          try {
            t = validateargs(...args);

            __request__ = t.__request__;

            if (event.input && t.eventpayload)
              await s.validateasync(s.object(event.input(s)), t.eventpayload);

            await event.invoke({
              io: this.io,
              socket,
              payload: t.eventpayload as EventPayload<ServerEvent>,
              cb: t.cb as EventCb<ServerEvent>,
              event: event.on,
              peer
            });
          } catch (e) {
            onerror({ error: e as Error, peer, socket, event, __request__ });
          }
        });
      }

      socket.on("disconnect", ondisconnect(peer));
    });
  }

  private async loadevents() {
    const dir = path.resolve(import.meta.dirname, "events");
    const files = fs
      .readdirSync(dir)
      .filter((file) => !file.startsWith("disconnect"))
      .map((file) => file.replace(/\.ts$/, ".js"));

    await Promise.all(
      files.map(async (file) => {
        const { handler }: { handler: E } = await import(`./events/${file}`);

        if (!handler) throw new Error(`no handler found for ${file}`);

        this.events.set(handler.on, handler);
      })
    );
  }
}

export const io = new SocketIO();
