import {
  Producer,
  Consumer,
  Transport,
  RtpCapabilities
} from "mediasoup/node/lib/types";
import { User } from "types";
import { TypedSocket } from "../socket/types";

export class Peer {
  static peers: Map<string, Peer> = new Map();

  // note to self: we're receiving the user from the client.
  // and peer.user because user corresponds with the client socket
  public user: User;
  public socket: TypedSocket;
  public active_room_id?: string;
  public rtp_capabilities?: RtpCapabilities;
  public producers: Map<string, Producer>;
  public consumers: Map<string, Consumer>;
  public transports: Map<string, Transport>;

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

  static remove(peer: Peer) {
    if (!this.peers.has(peer.user._id)) return;

    this.peers.delete(peer.user._id);
  }

  private closeProducers() {
    for (const producer of this.producers.values()) producer.close();

    this.producers.clear();
  }

  private closeTransports() {
    for (const transport of this.transports.values()) transport.close();

    this.transports.clear();
  }

  private closeConsumers() {
    for (const consumer of this.consumers.values()) consumer.close();

    this.consumers.clear();
  }

  reset() {
    this.closeProducers();
    this.closeTransports();
    this.closeConsumers();

    this.active_room_id = undefined;
    this.rtp_capabilities = undefined;
  }
}
