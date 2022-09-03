import { Peer } from "../../mediasoup/peer";
import { logger } from "./../../lib/logger";
import { SocketEventError } from "./../../utils/socket-event-error";
import { CustomError, NotAuthorizedError } from "@kamalyb/errors";
import type {
  Event,
  Payload,
  ServerEvent,
  ServerToClientEvents,
  TypedIO,
  TypedSocket
} from "./types";
import Joi from "joi";
import type { EventError, User } from "types";

type Arg = "payload" | "callback";

const overload = `
  (payload: object, cb: Function); 
  (payload: object); 
  (payload: undefined, cb: Function)
  (cb: Function); 
  ();
`;

const error = new Error(
  `parameters must satisfy the following overload: ${overload}`
);

export const isObjectOrThrow = (t: any, arg: Arg) => {
  if ((t && typeof t !== "object") || Array.isArray(t) || t instanceof Date)
    throw new Error(`expected ${arg} to be an object`);
};

export const isFunctionOrThrow = (t: any, arg: Arg) => {
  if (t && typeof t !== "function")
    throw new Error(`expected ${arg} to be a function`);
};

export const validateArgs = (
  ...args: any[]
): {
  cb: (() => void) | undefined;
  payload: Payload<ServerEvent> | undefined;
} => {
  if (!args.length) return { payload: undefined, cb: undefined };

  if (args.length > 2) throw error;

  const [payload, cb] = args;

  let callbackFn: (() => void) | undefined;
  let data: Payload<ServerEvent> | undefined;

  if (payload && cb) {
    isObjectOrThrow(payload, "payload");
    isFunctionOrThrow(cb, "callback");

    data = payload;
    callbackFn = cb;
  } else if (payload && !cb && typeof payload !== "function") {
    isObjectOrThrow(payload, "payload");

    data = payload;
    callbackFn = undefined;
  } else if (payload && !cb && typeof payload === "function") {
    data = undefined;
    callbackFn = payload;
  } else if (!payload && !cb) {
    data = undefined;
    callbackFn = undefined;
  } else if (!payload && cb) {
    isFunctionOrThrow(cb, "callback");

    data = undefined;
    callbackFn = cb;
  } else throw error;

  return { payload: data, cb: callbackFn };
};

export class NotJoinedError extends Error {
  constructor() {
    super("not joined in room");
  }
}

export class NoProducerFoundError extends Error {
  constructor(id: string) {
    super(`no producer with id ${id} found`);
  }
}

export class NoTransportFoundError extends Error {
  constructor(id: string) {
    super(`no transport with id ${id} found`);
  }
}

export class NoConsumerFoundError extends Error {
  constructor(id: string) {
    super(`no constumer with id ${id} found`);
  }
}

const schema = Joi.object<User, true>({
  _id: Joi.string(),
  display_name: Joi.string()
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

export const onError = ({
  error,
  peer,
  socket,
  event,
  __request__
}: {
  error: Error;
  socket: TypedSocket;
  event: Event<ServerEvent>;
  peer: Peer;
  __request__?: boolean;
}) => {
  // const ev = __request__ ? "request error" : "event error";

  const ev = "event error";

  const on = event.on;

  if (error instanceof CustomError) {
    const errors: EventError["errors"] = error.serialize();

    socket.emit(ev, new SocketEventError(errors, on));

    return;
  }

  if (!(error instanceof CustomError))
    logger.error(error.message, error, {
      capture: true,
      extra: {
        peer: { user: peer.user, active_room_id: peer.active_room_id },
        event: event.on
      }
    });

  socket.emit(
    ev,
    new SocketEventError(
      {
        message: error.message ?? "internal server error"
      },
      on
    )
  );
};
