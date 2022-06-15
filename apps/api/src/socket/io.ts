import { logger } from "../lib/logger";
import { Server } from "http";
import { Server as SocketServer } from "socket.io";
import { ServerEvent, TypedIO, Event, TypedSocket } from "./types";
import fs from "fs";
import path from "path";
import { SocketEventError } from "../lib/socket-event-error";
import { Request } from "express";
import { NotAuthorizedError, CustomError } from "@kamalyb/errors";
import { Peer } from "../mediasoup/peer";
import { User, EventError } from "types";
import { onDisconnect } from "./events/disconnect";
import * as Sentry from "@sentry/node";
import { env } from "../lib/env";
import Joi from "joi";
import { validatePayloadAndCb } from "../utils/socket";

const schema = Joi.object<User, true>({
  _id: Joi.string(),
  display_name: Joi.string()
});

const exclude: string[] = ["disconnect", "chat-message"];

class SocketIO {
  private _io?: TypedIO;
  public events = new Map<ServerEvent, Event<ServerEvent>>();

  get() {
    if (!this._io) throw new Error("io is not initialized");

    return this._io;
  }

  init(server: Server) {
    this._io = new SocketServer(server, {
      cors: {
        origin: env.WEB_URL,
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
      if (exclude.some((ex) => file.startsWith(ex))) continue;

      const handler = require(`./events/${file}`).default as Event<ServerEvent>;

      this.events.set(handler.on, handler);
    }

    this._io.use((socket, next) => {
      const raw = socket.handshake.query.user;
      if (!raw || typeof raw !== "string")
        return next(new NotAuthorizedError());

      let parsed;

      try {
        parsed = JSON.parse(raw);
      } catch (e) {}

      if (!parsed) return next(new NotAuthorizedError());

      const { error } = schema.validate(parsed);

      if (error) return next(new NotAuthorizedError());

      next();
    });

    this._io.on("connection", (socket) => {
      const raw = socket.handshake.query.user as string;
      const user = JSON.parse(raw) as User;
      const peer = Peer.create({ user, socket });

      logger.log({
        level: "info",
        dev: true,
        message: `peer ${peer.user.display_name} connected`.cyan
      });

      socket.join(peer.user._id);

      for (const event of this.events.values()) {
        socket.on(event.on, async (...args: any[]) => {
          if (!this._io) throw new Error("io is not initialized");

          try {
            const t = validatePayloadAndCb(...args);

            await event.invoke({
              io: this._io,
              socket,
              payload: t.payload as any,
              cb: t.cb as any,
              event: event.on,
              req: socket.request as Request,
              peer
            });
          } catch (error: any) {
            onError({ error, peer, socket, event });
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

      socket.on("disconnect", onDisconnect({ peer }));
    });
  }
}

export const io = new SocketIO();

function onError({
  error,
  peer,
  socket,
  event
}: {
  error: any;
  socket: TypedSocket;
  event: any;
  peer: Peer;
}) {
  // todo: handle mongo error

  if (error instanceof CustomError) {
    const errors: EventError["errors"] = error.serialize();

    return socket.emit(
      "event error",
      new SocketEventError(errors, event.on as any)
    );
  }

  if (!(error instanceof CustomError)) {
    Sentry.captureException(error, (scope) => {
      scope.setExtras({
        ctx: "io",
        peer: {
          user: peer.user
        },
        event: event.on
      });
      return scope;
    });
  }

  socket.emit(
    "event error",
    new SocketEventError(
      {
        message: env.isProduction ? "internal server error" : error.message
      },
      event.on as any
    )
  );
}
