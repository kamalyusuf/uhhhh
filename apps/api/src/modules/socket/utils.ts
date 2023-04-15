import { Peer } from "../mediasoup/peer";
import { logger } from "./../../lib/logger";
import { SocketEventError } from "./socket-event-error";
import {
  CustomError,
  JoiValidationError,
  NotAuthorizedError
} from "@kamalyb/errors";
import type {
  E,
  EventData,
  ServerEvent,
  ServerToClientEvents,
  TypedIO,
  TypedSocket
} from "./types";
import type { EventError, User, Anything } from "types";
import { isfunction, isobject } from "../../utils/is";
import { s } from "../../utils/schema";

const overload = `
  (data: object, cb: Function); 
  (data: object); 
  (data: undefined | {}, cb: Function);
  (cb: Function); 
  ();
`;

const overloaderror = new Error(
  `parameters must satisfy the following overload: ${overload}`
);

export const validateargs = (
  ...args: Anything[]
): {
  eventdata: EventData<ServerEvent> | undefined;
  cb: Function | undefined;
  __request__?: boolean | undefined;
} => {
  if (!args.length) return { eventdata: undefined, cb: undefined };

  if (args.length > 2) throw overloaderror;

  const [data, cb] = args;

  let callbackfn: (() => void) | undefined;
  let eventdata: EventData<ServerEvent> | undefined;

  let __request__ = false;

  const set = (p: { [key: string]: unknown }) => {
    if (!isobject(p)) throw new Error("expected data to be an object");

    if (typeof p.__request__ === "undefined")
      return p as EventData<ServerEvent>;

    if (!p.data)
      throw new Error(
        `expected data to be contained in 'data' property if __request__ (i.e the request is coming from 'socketrequest' function) is present [and must be true]`
      );

    const { error } = s.validate(
      s.object<{}>({
        __request__: s.boolean().valid(true),
        data: s.anyobject()
      }),
      p
    );

    if (error) throw new JoiValidationError(error.details);

    __request__ = true;

    return p.data as EventData<ServerEvent>;
  };

  if (data && cb) {
    if (!isobject(data)) throw new Error("expected data to be an object");

    if (!isfunction(cb)) throw new Error("expected callback to be a function");

    eventdata = set(data);
    callbackfn = cb;
  } else if (data && !cb && typeof data !== "function") {
    if (!isobject(data)) throw new Error("expected data to be an object");

    eventdata = set(data);
    callbackfn = undefined;
  } else if (data && !cb && typeof data === "function") {
    eventdata = undefined;
    callbackfn = data;
  } else if (!data && !cb) {
    eventdata = undefined;
    callbackfn = undefined;
  } else if (!data && cb) {
    if (!isfunction(cb)) throw new Error("expected callback to be a function");

    eventdata = undefined;
    callbackfn = cb;
  } else throw overloaderror;

  return { eventdata, cb: callbackfn, __request__ };
};

export class NotInRoomError extends Error {
  constructor() {
    super("not in room");
  }
}

export class NoProducerFoundError extends Error {
  constructor() {
    super("producer not found");
  }
}

export class NoTransportFoundError extends Error {
  constructor() {
    super("transport not found");
  }
}

export class NoConsumerFoundError extends Error {
  constructor() {
    super("consumer not found");
  }
}

const schema = s.object<User>({
  _id: s.string(),
  display_name: s.string()
});

export const authenticate: Parameters<TypedIO["use"]>[0] = (socket, next) => {
  const raw = socket.handshake.query.user;

  if (!raw || typeof raw !== "string") return next(new NotAuthorizedError());

  let parsed;

  try {
    parsed = JSON.parse(raw);
  } catch (e) {}

  if (!parsed) return next(new NotAuthorizedError());

  const { error } = schema.validate(parsed);

  if (error) return next(new NotAuthorizedError());

  next();
};

export const onerror = ({
  error,
  peer,
  socket,
  event,
  __request__
}: {
  error: Error;
  socket: TypedSocket;
  event: E;
  peer: Peer;
  __request__?: boolean;
}) => {
  const ev = __request__ ? "request error" : "error";

  const on = event.on as Exclude<keyof ServerToClientEvents, "request error">;

  if (error instanceof CustomError) {
    const errors: EventError["errors"] = error.serialize();

    socket.emit(ev, new SocketEventError(errors, on));

    return;
  }

  logger.error(error.message, error, {
    capture: true,
    extra: {
      user: peer.user,
      event: event.on
    }
  });

  socket.emit(
    ev,
    new SocketEventError(
      {
        message: error.message
      },
      on
    )
  );
};
