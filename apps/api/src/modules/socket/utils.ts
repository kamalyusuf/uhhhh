import { Peer } from "../mediasoup/peer";
import { logger } from "./../../lib/logger";
import { SocketEventError } from "./socket-event-error";
import {
  CustomError,
  JoiValidationError,
  NotAuthorizedError,
  UnprocessableEntityError
} from "@kamalyb/errors";
import type {
  E,
  EventPayload,
  ServerEvent,
  TypedIO,
  TypedSocket
} from "./types";
import type { User, Anything } from "types";
import { v } from "../../utils/validation";
import { s } from "../../utils/schema";
import joi from "joi";

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
  eventpayload: EventPayload<ServerEvent> | undefined;
  cb: Function | undefined;
  __request__?: boolean | undefined;
} => {
  if (!args.length) return { eventpayload: undefined, cb: undefined };

  if (args.length > 2) throw overloaderror;

  const [data, cb] = args;

  let callbackfn: (() => void) | undefined;
  let eventpayload: EventPayload<ServerEvent> | undefined;

  let __request__ = false;

  const set = (p: { [key: string]: unknown }) => {
    if (!v.isobject(p))
      throw new UnprocessableEntityError("expected data to be an object");

    if (typeof p.__request__ === "undefined")
      return p as EventPayload<ServerEvent>;

    if (!p.payload)
      throw new UnprocessableEntityError(
        `expected payload to be contained in 'payload' property if __request__ (i.e the request is coming from 'socketrequest' function) is present [and must be true]`
      );

    const { error } = s.validate(
      s.object<{}>({
        __request__: s.boolean().valid(true),
        payload: s.anyobject()
      }),
      p
    );

    if (error) throw new JoiValidationError(error.details);

    __request__ = true;

    return p.payload as EventPayload<ServerEvent>;
  };

  if (data && cb) {
    if (!v.isobject(data))
      throw new UnprocessableEntityError("expected data to be an object");

    if (!v.isfunction(cb))
      throw new UnprocessableEntityError("expected callback to be a function");

    eventpayload = set(data);
    callbackfn = cb;
  } else if (data && !cb && typeof data !== "function") {
    if (!v.isobject(data))
      throw new UnprocessableEntityError("expected data to be an object");

    eventpayload = set(data);
    callbackfn = undefined;
  } else if (data && !cb && typeof data === "function") {
    eventpayload = undefined;
    callbackfn = data;
  } else if (!data && !cb) {
    eventpayload = undefined;
    callbackfn = undefined;
  } else if (!data && cb) {
    if (!v.isfunction(cb))
      throw new UnprocessableEntityError("expected callback to be a function");

    eventpayload = undefined;
    callbackfn = cb;
  } else throw overloaderror;

  return { eventpayload, cb: callbackfn, __request__ };
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
  socket,
  event,
  peer,
  __request__
}: {
  error: Error;
  socket: TypedSocket;
  event: E;
  peer: Peer;
  __request__?: boolean;
}) => {
  const ev = __request__ ? "request error" : "error";

  if (error instanceof CustomError)
    return socket.emit(ev, new SocketEventError(error.serialize(), event.on));

  if (error instanceof joi.ValidationError)
    return socket.emit(ev, {
      event: event.on,
      errors: error.details.map((ve) => ({
        message: ve.message,
        path: ve.path.at(0)?.toString()
      }))
    });

  logger.error(error, {
    extra: {
      event: event.on,
      user: peer.user,
      __request__
    }
  });

  socket.emit(
    ev,
    new SocketEventError(
      {
        message: error.message
      },
      event.on
    )
  );
};
