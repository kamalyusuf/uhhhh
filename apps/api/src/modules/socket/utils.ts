import joi from "joi";
import { logger } from "./../../lib/logger.js";
import { SocketEventError } from "./socket-event-error.js";
import {
  CustomError,
  JoiValidationError,
  NotAuthorizedError,
  UnprocessableEntityError
} from "@kamalyb/errors";
import { s } from "../../utils/schema.js";
import type { Peer } from "../mediasoup/peer.js";
import type { User, Anything, AnyObject, Fn } from "types";
import type {
  E,
  EventPayload,
  ServerEvent,
  TypedIO,
  TypedSocket
} from "./types.js";

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
  cb: Fn | undefined;
  __request__?: boolean | undefined;
} => {
  if (!args.length) return { eventpayload: undefined, cb: undefined };

  if (args.length > 2) throw overloaderror;

  const [data, cb] = args;

  let callbackfn: (() => void) | undefined;
  let eventpayload: EventPayload<ServerEvent> | undefined;

  let __request__ = false;

  const set = (p: { [key: string]: unknown }) => {
    if (!isobject(p))
      throw new UnprocessableEntityError("expected data to be an object");

    if (typeof p.__request__ === "undefined")
      return p as EventPayload<ServerEvent>;

    if (!p.payload)
      throw new UnprocessableEntityError(
        `expected payload to be contained in 'payload' property if __request__ (i.e the request is coming from 'request' function) is present [and must be true]`
      );

    const { error, value } = s.validate(
      s.object<{
        payload: AnyObject;
        __request__: true;
      }>({
        __request__: s.boolean().valid(true),
        payload: s.anyobject()
      }),
      p
    );

    if (error) throw new JoiValidationError(error.details);

    __request__ = value.__request__;

    return value.payload as EventPayload<ServerEvent>;
  };

  if (data && cb) {
    if (!isobject(data))
      throw new UnprocessableEntityError("expected data to be an object");

    if (!isfunction(cb))
      throw new UnprocessableEntityError("expected callback to be a function");

    eventpayload = set(data);
    callbackfn = cb;
  } else if (data && !cb && typeof data !== "function") {
    if (!isobject(data))
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
    if (!isfunction(cb))
      throw new UnprocessableEntityError("expected callback to be a function");

    eventpayload = undefined;
    callbackfn = cb;
  } else throw overloaderror;

  return { eventpayload, cb: callbackfn, __request__ };
};

const UserSchema = s.object<User>({
  _id: s.string(),
  display_name: s.string()
});

export const authenticate: Parameters<TypedIO["use"]>[0] = (socket, next) => {
  const raw = socket.handshake.query["@me"];

  if (!raw || typeof raw !== "string") return next(new NotAuthorizedError());

  let parsed;

  try {
    parsed = JSON.parse(raw);
  } catch (e) {}

  if (!parsed) return next(new NotAuthorizedError());

  const { error } = UserSchema.validate(parsed);

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
  const on = __request__ ? "request error" : "error";

  if (error instanceof CustomError)
    return socket.emit(on, new SocketEventError(event.on, error.serialize()));

  if (joi.isError(error))
    return socket.emit(
      on,
      new SocketEventError(
        event.on,
        new JoiValidationError(error.details).serialize()
      )
    );

  logger.error(error, {
    extra: {
      event: event.on,
      user: peer.user,
      __request__
    }
  });

  return socket.emit(
    on,
    new SocketEventError(event.on, {
      message: error.message
    })
  );
};

function isobject(x: unknown) {
  return !(
    typeof x !== "object" ||
    Array.isArray(x) ||
    x instanceof Date ||
    x === null ||
    x instanceof Map
  );
}

function isfunction(x: unknown) {
  return typeof x === "function";
}
