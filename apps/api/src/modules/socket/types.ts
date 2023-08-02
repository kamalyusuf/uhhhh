import type {
  DtlsParameters,
  MediaKind,
  RtpCapabilities,
  RtpParameters,
  WebRtcTransport,
  ConsumerType
} from "mediasoup/node/lib/types";
import type {
  ServerToClientEvents as TServerToClientEvents,
  ClientToServerEvents as TClientToServerEvents,
  InterServerEvents,
  SocketData
} from "types";
import type { Socket, Server as SocketServer } from "socket.io";
import type { Peer } from "../mediasoup/peer";

interface OutgoingTransportOptions {
  id: WebRtcTransport["id"];
  ice_parameters: WebRtcTransport["iceParameters"];
  ice_candidates: WebRtcTransport["iceCandidates"];
  dtls_parameters: WebRtcTransport["dtlsParameters"];
  sctp_parameters: WebRtcTransport["sctpParameters"];
}

export type ServerToClientEvents = TServerToClientEvents<
  RtpCapabilities,
  OutgoingTransportOptions,
  MediaKind,
  RtpParameters,
  ConsumerType
>;

export type ClientToServerEvents = TClientToServerEvents<
  RtpCapabilities,
  DtlsParameters,
  MediaKind,
  RtpParameters,
  OutgoingTransportOptions
>;

export type ServerEvent = keyof ClientToServerEvents;
export type ClientEvent = keyof ServerToClientEvents;

export type TypedIO = SocketServer<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

export type TypedSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

export type EventPayload<T extends ServerEvent> = Parameters<
  ClientToServerEvents[T]
>[0] extends Function
  ? never
  : Parameters<ClientToServerEvents[T]>[0];

export type EventCb<T extends ServerEvent> = Parameters<
  ClientToServerEvents[T]
>[0] extends Function
  ? Parameters<ClientToServerEvents[T]>[0]
  : Parameters<ClientToServerEvents[T]>[1] extends Function
  ? Parameters<ClientToServerEvents[T]>[1]
  : undefined;

export interface BaseParams<T extends ServerEvent> {
  io: TypedIO;
  socket: TypedSocket;
  event: T;
  peer: Peer;
  payload: EventPayload<T>;
}

export interface CallbackEventParams<T extends ServerEvent>
  extends BaseParams<T> {
  cb: EventCb<T>;
}

export type InvokeParams<T extends ServerEvent> =
  | EventParams<T>
  | CallbackEventParams<T>;

interface EventParams<T extends ServerEvent> extends BaseParams<T> {}

type Invoke<T extends ServerEvent> = (
  t: InvokeParams<T>
) => void | Promise<void>;

interface BaseEvent<T extends ServerEvent> {
  on: T;
  invoke: Invoke<T>;
}

export interface Event<T extends ServerEvent> extends BaseEvent<T> {}

export interface CallbackEvent<T extends ServerEvent>
  extends Omit<BaseEvent<T>, "invoke"> {
  invoke: (t: CallbackEventParams<T>) => void | Promise<void>;
}

export type E = Event<ServerEvent> | CallbackEvent<ServerEvent>;
