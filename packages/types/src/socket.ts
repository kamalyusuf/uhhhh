import { Room, ChatMessage } from "./room";
import { User } from "./user";

type Cb<T> = (t: T) => void;

export type Direction = "send" | "receive";

export interface ServerToClientEvents<
  RtpCapabilities,
  OutgoingTransport,
  MediaKind,
  RtpParameters,
  ConsumerType
> {
  "rtp capabilities": (t: { rtp_capabilities: RtpCapabilities }) => void;

  "create transport": (t: { transport: OutgoingTransport }) => void;

  "connect transport": () => void;

  produce: (t: { id: string }) => void;

  join: (t: { peers: User[] }) => void;

  test: (t: any) => void;

  "event error": (t: {
    message: string;
    event: Exclude<
      keyof ServerToClientEvents<
        RtpCapabilities,
        OutgoingTransport,
        MediaKind,
        RtpParameters,
        ConsumerType
      >,
      "error" | "event error"
    >;
  }) => void;

  error: (t: { message: string }) => void;

  rooms: (t: { rooms: Room[] }) => void;

  "create room": (t: { room: Room }) => void;

  "close producer": () => void;

  "pause producer": () => void;

  "resume producer": () => void;

  "new peer": (t: { peer: User }) => void;

  "new consumer": (t: {
    peer_id: string;
    producer_id: string;
    id: string;
    kind: MediaKind;
    rtp_parameters: RtpParameters;
    type: ConsumerType;
    producer_paused: boolean;
    app_data: Record<string, string>;
  }) => void;

  "consumer closed": (t: { consumer_id: string; peer_id: string }) => void;

  "consumer paused": (t: { consumer_id: string; peer_id: string }) => void;

  "consumer resumed": (t: { consumer_id: string; peer_id: string }) => void;

  "consumer score": (t: {
    consumer_id: string;
    score: any;
    peer_id: string;
  }) => void;

  "consumer layers changed": (t: any) => void;

  leave: () => void;

  "peer left": (t: { peer: User }) => void;

  "active speaker": (t: { peer_id: string; speaking: boolean }) => void;

  "delete room": (t: { room_id: string }) => void;

  "consumer consumed": () => void;

  "chat message": (t: { message: ChatMessage }) => void;

  "update display name": () => void;

  "update room members count": (t: {
    room_id: string;
    members_count: number;
  }) => void;
}

export interface ClientToServerEvents<
  RtpCapabilities,
  DtlsParameters,
  MediaKind,
  RtpParameters,
  TransportOptions
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
      direction: Direction;
    },
    cb: Cb<{ transport_options: TransportOptions }>
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
      app_data: Record<string, string>;
    },
    cb: Cb<{ id: string }>
  ) => void;

  join: (
    t: {
      room_id: string;
      rtp_capabilities: RtpCapabilities; // only if we want to consume
    },
    cb: Cb<{ peers: User[] }>
  ) => void;

  test: (t: any, cb: Cb<any>) => void;

  rooms: (t: undefined, cb: Cb<{ rooms: Room[] }>) => void;

  "create room": (
    t: { name: string; description: string },
    cb: Cb<{ room: Room }>
  ) => void;

  "close producer": (t: { producer_id: string }, cb: Cb<undefined>) => void;

  "pause producer": (t: { producer_id: string }, cb: Cb<undefined>) => void;

  "resume producer": (t: { producer_id: string }, cb: Cb<undefined>) => void;

  leave: (t: undefined, cb: Cb<undefined>) => void;

  "active speaker": (t: { speaking: boolean }, cb: void) => void;

  "consumer consumed": (t: { consumer_id: string }, cb: void) => void;

  "chat message": (t: { content: string }, cb: void) => void;

  "update display name": (t: { new_display_name: string }, cb: void) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {}
