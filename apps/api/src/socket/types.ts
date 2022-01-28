import {
  DtlsParameters,
  MediaKind,
  RtpCapabilities,
  RtpParameters,
  WebRtcTransport
} from "mediasoup/node/lib/types";
import {
  ServerToClientEvents as TServerToClientEvents,
  ClientToServerEvents as TClientToServerEvents,
  InterServerEvents,
  SocketData
} from "types";
import { Socket, Server as SocketServer } from "socket.io";

interface OutgoingTransport {
  id: WebRtcTransport["id"];
  ice_parameters: WebRtcTransport["iceParameters"];
  ice_candidates: WebRtcTransport["iceCandidates"];
  dtls_parameters: WebRtcTransport["dtlsParameters"];
  sctp_parameters: WebRtcTransport["sctpParameters"];
}

export type ServerToClientEvents = TServerToClientEvents<
  RtpCapabilities,
  OutgoingTransport
>;

export type ClientToServerEvents = TClientToServerEvents<
  RtpCapabilities,
  DtlsParameters,
  MediaKind,
  RtpParameters,
  OutgoingTransport
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

interface Action<K extends ClientEvent> {
  emit: K;
  to: string[];
  send: Parameters<ServerToClientEvents[K]>[0];
}

export interface Event<K extends ServerEvent> {
  on: K;
  // invoke: (
  //   socket: Socket<
  //     ClientToServerEvents,
  //     ServerToClientEvents,
  //     InterServerEvents,
  //     SocketData
  //   >,
  //   payload: Parameters<ClientToServerEvents[K]>
  // ) => Promise<Action<K>>;
  invoke: (t: {
    io: TypedIO;
    socket: TypedSocket;
    payload: Parameters<ClientToServerEvents[K]>[0];
    cb: Parameters<ClientToServerEvents[K]>[1];
    event: K;
  }) => Promise<Action<K>> | void | Promise<void>;
  // invoke: (
  //   payload: Parameters<ClientToServerEvents[K]>
  // ) => Promise<(Action<K> | undefined)[]>;
}
