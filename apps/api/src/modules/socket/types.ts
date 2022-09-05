import {
  type DtlsParameters,
  type MediaKind,
  type RtpCapabilities,
  type RtpParameters,
  WebRtcTransport,
  type ConsumerType
} from "mediasoup/node/lib/types";
import type {
  ServerToClientEvents as TServerToClientEvents,
  ClientToServerEvents as TClientToServerEvents,
  InterServerEvents,
  SocketData
} from "types";
import { Socket, Server as SocketServer } from "socket.io";
import { Peer } from "../mediasoup/peer";

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

export type Payload<E extends ServerEvent> = Parameters<
  ClientToServerEvents[E]
>[0] extends Function
  ? never
  : Parameters<ClientToServerEvents[E]>[0];

export type EventCb<E extends ServerEvent> = Parameters<
  ClientToServerEvents[E]
>[0] extends Function
  ? Parameters<ClientToServerEvents[E]>[0]
  : Parameters<ClientToServerEvents[E]>[1] extends Function
  ? Parameters<ClientToServerEvents[E]>[1]
  : undefined;

export interface BaseParams<E extends ServerEvent> {
  io: TypedIO;
  socket: TypedSocket;
  event: E;
  peer: Peer;
  payload: Payload<E>;
}

export interface CallbackEventParams<E extends ServerEvent>
  extends BaseParams<E> {
  cb: EventCb<E>;
}

export type InvokeParams<E extends ServerEvent> =
  | EventParams<E>
  | CallbackEventParams<E>;

interface EventParams<E extends ServerEvent> extends BaseParams<E> {}

type Invoke<E extends ServerEvent> = (
  t: InvokeParams<E>
) => void | Promise<void>;

interface BaseEvent<E extends ServerEvent> {
  on: E;
  invoke: Invoke<E>;
}

export interface Event<E extends ServerEvent> extends BaseEvent<E> {}

export interface CallbackEvent<E extends ServerEvent>
  extends Omit<BaseEvent<E>, "invoke"> {
  invoke: (t: CallbackEventParams<E>) => void | Promise<void>;
}

export type E = Event<ServerEvent> | CallbackEvent<ServerEvent>;
