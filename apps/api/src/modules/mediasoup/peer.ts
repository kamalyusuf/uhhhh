import type {
  Producer,
  Consumer,
  Transport,
  RtpCapabilities
} from "mediasoup/node/lib/types.js";
import type { User } from "types";
import type { ServerToClientEvents, TypedSocket } from "../socket/types.js";
import type { AppData } from "./types.js";

export class Peer {
  private static peers: Map<string, Peer> = new Map();

  public user: User;
  public active_room_id?: string;
  public rtp_capabilities?: RtpCapabilities;
  public producers: Map<string, Producer>;
  public consumers: Map<string, Consumer>;
  public transports: Map<string, Transport<AppData>>;
  public socket: TypedSocket;

  private constructor({ user, socket }: { user: User; socket: TypedSocket }) {
    this.user = user;
    this.socket = socket;

    this.producers = new Map();
    this.consumers = new Map();
    this.transports = new Map();
  }

  static create(t: { user: User; socket: TypedSocket }) {
    const peer = new Peer(t);

    this.peers.set(peer.user._id, peer);

    return peer;
  }

  static remove(peer: Peer): boolean {
    return this.peers.delete(peer.user._id);
  }

  private closeproducers(): void {
    for (const producer of this.producers.values()) producer.close();

    this.producers.clear();
  }

  private closetransports(): void {
    for (const transport of this.transports.values()) transport.close();

    this.transports.clear();
  }

  private closeconsumers(): void {
    for (const consumer of this.consumers.values()) consumer.close();

    this.consumers.clear();
  }

  notify<T extends keyof ServerToClientEvents>(
    event: T,
    data: Parameters<ServerToClientEvents[T]>
  ): void {
    this.socket.emit(event, ...data);
  }

  reset(): void {
    this.closeproducers();
    this.closetransports();
    this.closeconsumers();

    this.active_room_id = undefined;
    this.rtp_capabilities = undefined;
  }
}
