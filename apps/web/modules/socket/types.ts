import type {
  DtlsParameters,
  MediaKind,
  RtpCapabilities,
  RtpParameters,
  TransportOptions as TTransportOptions
} from "mediasoup-client/lib/types";
import type {
  ServerToClientEvents as TServerToClientEvents,
  ClientToServerEvents as TClientToServerEvents,
  Anything
} from "types";
import type { Socket } from "socket.io-client";

type TransportOptions = {
  id: TTransportOptions["id"];
  ice_parameters: TTransportOptions["iceParameters"];
  ice_candidates: TTransportOptions["iceCandidates"];
  dtls_parameters: TTransportOptions["dtlsParameters"];
  sctp_parameters: TTransportOptions["sctpParameters"];
  ice_servers?: TTransportOptions["iceServers"];
  ice_transport_policy?: TTransportOptions["iceTransportPolicy"];
  additional_settings?: Anything;
  proprietary_constraints?: Anything;
  app_data?: Record<string, Anything>;
};

export type ServerToClientEvents = TServerToClientEvents<
  RtpCapabilities,
  TransportOptions,
  MediaKind,
  RtpParameters,
  Anything
>;

export type ClientToServerEvents = TClientToServerEvents<
  RtpCapabilities,
  DtlsParameters,
  MediaKind,
  RtpParameters,
  TransportOptions
>;

export type ServerEvent = keyof ClientToServerEvents;
export type ClientEvent = keyof ServerToClientEvents;

export type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;
