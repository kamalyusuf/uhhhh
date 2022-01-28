import { Room } from "./room";
import { User } from "./user";

type Cb<T> = (t: T) => void;

export interface ServerToClientEvents<RtpCapabilities, OutgoingTransport> {
  "rtp capabilities": (t: { rtp_capabilities: RtpCapabilities }) => void;

  "create transport": (t: { transport: OutgoingTransport }) => void;

  "connect transport": () => void;

  produce: (t: { id: string }) => void;

  join: (t: { users: User[] }) => void;

  test: (t: any) => void;

  error: (t: {
    message: string;
    event: Exclude<
      keyof ServerToClientEvents<RtpCapabilities, OutgoingTransport>,
      "error"
    >;
  }) => void;

  rooms: (t: { rooms: Room[] }) => void;

  "create room": (t: { room: Room }) => void;
}

export interface ClientToServerEvents<
  RtpCapabilities,
  DtlsParameters,
  MediaKind,
  RtpParameters,
  OutgoingTransport
> {
  "rtp capabilities": (
    t: { room_id: string },
    cb: Cb<{ rtp_capabilities: RtpCapabilities }>
  ) => void;

  "create transport": (
    t: {
      room_id: string;
      producing: boolean;
      consuming: boolean;
    },
    cb: Cb<{ transport: OutgoingTransport }>
  ) => void;

  "connect transport": (
    t: {
      room_id: string;
      transport_id: string;
      dtls_parameters: DtlsParameters;
    },
    cb: () => void
  ) => void;

  produce: (
    t: {
      room_id: string;
      transport_id: string;
      kind: MediaKind;
      rtp_parameters: RtpParameters;
    },
    cb: Cb<{ id: string }>
  ) => void;

  join: (
    t: {
      room_id: string;
      display_name: string;
      device: Record<string, string>;
      rtp_capabilities?: RtpCapabilities; // only if we want to consume
    },
    cb: Cb<{ users: User[] }>
  ) => void;

  test: (t: any, cb: Cb<any>) => void;

  rooms: (t: undefined, cb: Cb<{ rooms: Room[] }>) => void;

  "create room": (
    t: { name: string; description: string },
    cb: Cb<{ room: Room }>
  ) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {}
