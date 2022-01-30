import { Peer } from "./peer";
import { Router, RtpCapabilities, Producer } from "mediasoup/node/lib/types";
import { EventEmitter } from "events";
import { config } from "./config";
import { workers } from "./workers";
import { NotFoundError } from "@kamalyb/errors";
import { TypedIO } from "../socket/types";

export class MediasoupRoom extends EventEmitter {
  static rooms: Map<string, MediasoupRoom> = new Map();

  public id: string;
  public peers: Map<string, Peer>;
  public router: Router;

  private constructor({ id, router }: { id: string; router: Router }) {
    super();
    this.setMaxListeners(Infinity);

    this.id = id;
    this.router = router;

    this.peers = new Map<string, Peer>();
  }

  static async create({ id }: { id: string }) {
    const router = await workers.next().createRouter({
      mediaCodecs: config.mediasoup.router.media_codecs
    });

    const room = new MediasoupRoom({ id, router });
    this.rooms.set(room.id, room);
    return room;
  }

  static findById(room_id: string) {
    const room = this.rooms.get(room_id);
    if (!room) {
      throw new NotFoundError("no mediasoup room found");
    }

    return room;
  }

  static async findOrCreate(room_id: string): Promise<MediasoupRoom> {
    const room = this.rooms.get(room_id);
    if (room) {
      return room;
    }

    return this.create({ id: room_id });
  }

  static remove(room_id: string) {
    if (this.rooms.has(room_id)) {
      this.rooms.delete(room_id);
    }
  }

  get rtpCapabilities(): RtpCapabilities {
    return this.router.rtpCapabilities;
  }

  join(peer: Peer) {
    if (this.peers.has(peer.user._id)) {
      throw new Error("peer already joined");
    }

    this.peers.set(peer.user._id, peer);
  }

  users() {
    return Array.from(this.peers.values()).map((peer) => peer.user);
  }

  _peers() {
    return Array.from(this.peers.values());
  }

  hasPeer(id: string) {
    return this.peers.has(id);
  }

  async createConsumer({
    io,
    consumer_peer,
    producer_peer,
    producer
  }: {
    io: TypedIO;
    consumer_peer: Peer;
    producer_peer: Peer;
    producer: Producer;
  }) {
    if (
      !consumer_peer.rtpCapabilities ||
      !this.router.canConsume({
        producerId: producer.id,
        rtpCapabilities: consumer_peer.rtpCapabilities
      })
    ) {
      return;
    }

    const transports = Array.from(consumer_peer.transports.values());
    const transport = transports.find((t) => t.appData.direction === "receive");
    if (!transport) {
      return;
    }

    const consumer = await transport.consume({
      producerId: producer.id,
      rtpCapabilities: consumer_peer.rtpCapabilities,
      paused: true
    });

    consumer_peer.consumers.set(consumer.id, consumer);

    consumer.on("transportclose", () => {
      consumer_peer.consumers.delete(consumer.id);
    });

    consumer.on("producerclose", () => {
      consumer_peer.consumers.delete(consumer.id);
      io.to(consumer_peer.user._id).emit("consumer closed", {
        consumer_id: consumer.id,
        peer_id: producer_peer.user._id
      });
    });

    consumer.on("producerpause", () => {
      io.to(consumer_peer.user._id).emit("consumer paused", {
        consumer_id: consumer.id,
        peer_id: producer_peer.user._id
      });
    });

    consumer.on("producerresume", () => {
      io.to(consumer_peer.user._id).emit("consumer resumed", {
        consumer_id: consumer.id,
        peer_id: producer_peer.user._id
      });
    });

    consumer.on("score", (score) => {
      io.to(consumer_peer.user._id).emit("consumer score", {
        consumer_id: consumer.id,
        peer_id: producer_peer.user._id,
        score
      });
    });

    io.to(consumer_peer.user._id).emit("new consumer", {
      peer_id: producer_peer.user._id,
      producer_id: producer.id,
      id: consumer.id,
      kind: consumer.kind,
      rtp_parameters: consumer.rtpParameters,
      type: consumer.type,
      app_data: producer.appData,
      producer_paused: consumer.producerPaused
    });

    await consumer.resume();
  }

  leave(peer: Peer) {
    if (
      !peer.activeRoomId ||
      !this.peers.has(peer.user._id) ||
      peer.activeRoomId !== this.id
    ) {
      return;
    }

    for (const producer of peer.producers.values()) {
      producer.close();
    }

    for (const transport of peer.transports.values()) {
      transport.close();
    }

    for (const consumer of peer.consumers.values()) {
      consumer.close();
    }

    peer.activeRoomId = undefined;
    this.peers.delete(peer.user._id);

    if (this._peers().length === 0) {
      // todo: delete the room from database
      MediasoupRoom.remove(this.id);
    }
  }
}
