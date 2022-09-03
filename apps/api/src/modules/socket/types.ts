import {
  DtlsParameters,
  MediaKind,
  RtpCapabilities,
  RtpParameters,
  WebRtcTransport,
  ConsumerType
} from "mediasoup/node/lib/types";
import {
  ServerToClientEvents as TServerToClientEvents,
  ClientToServerEvents as TClientToServerEvents,
  InterServerEvents,
  SocketData
} from "types";
import { Socket, Server as SocketServer } from "socket.io";
import { Peer } from "../../mediasoup/peer";

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

export type Payload<K extends ServerEvent> = Parameters<
  ClientToServerEvents[K]
>[0] extends Function
  ? undefined
  : Parameters<ClientToServerEvents[K]>[0];

export type EventCb<K extends ServerEvent> = Parameters<
  ClientToServerEvents[K]
>[0] extends Function
  ? Parameters<ClientToServerEvents[K]>[0]
  : Parameters<ClientToServerEvents[K]>[1] extends Function
  ? Parameters<ClientToServerEvents[K]>[1]
  : undefined;

export interface Event<K extends ServerEvent> {
  on: K;
  invoke: (t: {
    io: TypedIO;
    socket: TypedSocket;
    event: K;
    peer: Peer;
    payload: Payload<K>;
    cb: EventCb<K>;
    // cb: Parameters<ClientToServerEvents[K]>[0] extends Function
    //   ? Parameters<ClientToServerEvents[K]>[0]
    //   : Parameters<ClientToServerEvents[K]>[1] extends Function
    //   ? Parameters<ClientToServerEvents[K]>[1]
    //   : undefined;
  }) => void | Promise<void>;
}
