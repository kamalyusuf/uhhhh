import { Payload, ServerEvent } from "../socket/types";

type Arg = "payload" | "callback";

const overload = `
  (payload: object, cb: Function); 
  (payload: object); 
  (cb: Function); 
  ();
`;

const error = new Error(
  `parameters must satisfy the following overload: ${overload}`
);

export const isObjectOrThrow = (t: any, arg: Arg) => {
  if (typeof t !== "object" || Array.isArray(t) || t instanceof Date)
    throw new Error(`expected ${arg} to be an object`);
};

export const isFunctionOrThrow = (t: any, arg: Arg) => {
  if (typeof t !== "function")
    throw new Error(`expected ${arg} to be a function`);
};

export const validatePayloadAndCb = (
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
  } else throw error;

  return { payload: data, cb: callbackFn };
};
