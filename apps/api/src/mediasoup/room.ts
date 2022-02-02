import { Peer } from "./peer";
import {
  Router,
  RtpCapabilities,
  Producer,
  Consumer
} from "mediasoup/node/lib/types";
import { EventEmitter } from "events";
import { config } from "./config";
import { workers } from "./workers";
import { NotFoundError } from "@kamalyb/errors";
import { TypedIO } from "../socket/types";
import { logger } from "../lib/logger";
import { roomService } from "../modules/room/room.service";
import { Types } from "mongoose";

export class MediasoupRoom extends EventEmitter {
  static rooms: Map<string, MediasoupRoom> = new Map();

  public id: string;
  public peers: Map<string, Peer>;
  public router: Router;
  private _io: TypedIO;

  private constructor({
    id,
    router,
    io
  }: {
    id: string;
    router: Router;
    io: TypedIO;
  }) {
    super();
    this.setMaxListeners(Infinity);

    this.id = id;
    this.router = router;
    this._io = io;

    this.peers = new Map<string, Peer>();
  }

  static async create({ id, io }: { id: string; io: TypedIO }) {
    const router = await workers.next().createRouter({
      mediaCodecs: config.mediasoup.router.media_codecs
    });

    const room = new MediasoupRoom({ id, router, io });
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

  static async findOrCreate(
    room_id: string,
    io: TypedIO
  ): Promise<MediasoupRoom> {
    const room = this.rooms.get(room_id);
    if (room) {
      return room;
    }

    return this.create({ id: room_id, io });
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
    consumer_peer,
    producer_peer,
    producer
  }: {
    consumer_peer: Peer;
    producer_peer: Peer;
    producer: Producer;
  }) {
    if (!consumer_peer.rtpCapabilities) {
      logger.log({
        level: "warn",
        dev: true,
        message: `[createConsumer()] ${consumer_peer.user.display_name} does not have rtpCapabilities. returning`
      });

      return;
    }

    if (
      !this.router.canConsume({
        producerId: producer.id,
        rtpCapabilities: consumer_peer.rtpCapabilities
      })
    ) {
      logger.log({
        level: "warn",
        dev: true,
        message: `[createConsumer()] router cannot consume ${consumer_peer.user.display_name}'s rtpCapabilities or maybe the producer with id ${producer.id}. returning`
      });

      return;
    }

    const transports = Array.from(consumer_peer.transports.values());
    const transport = transports.find((t) => t.appData.direction === "receive");
    if (!transport) {
      logger.log({
        level: "warn",
        dev: true,
        message: `[createConsumer()] transport not found for consumer_peer ${consumer_peer.user.display_name}`
      });

      return;
    }

    let consumer: Consumer;

    try {
      consumer = await transport.consume({
        producerId: producer.id,
        rtpCapabilities: consumer_peer.rtpCapabilities,
        paused: true
      });
    } catch (e: any) {
      logger.log({
        level: "warn",
        dev: true,
        message: `[createConsumer() -> transport.consume()] ${e.message} for consumer_peer ${consumer_peer.user.display_name} and producer_peer ${producer_peer.user.display_name}`
      });

      return;
    }

    consumer_peer.consumers.set(consumer.id, consumer);

    consumer.on("transportclose", () => {
      consumer_peer.consumers.delete(consumer.id);
    });

    consumer.on("producerclose", () => {
      consumer_peer.consumers.delete(consumer.id);
      consumer_peer.socket.emit("consumer closed", {
        consumer_id: consumer.id,
        peer_id: producer_peer.user._id
      });
    });

    consumer.on("producerpause", () => {
      consumer_peer.socket.emit("consumer paused", {
        consumer_id: consumer.id,
        peer_id: producer_peer.user._id
      });
    });

    consumer.on("producerresume", () => {
      consumer_peer.socket.emit("consumer resumed", {
        consumer_id: consumer.id,
        peer_id: producer_peer.user._id
      });
    });

    consumer.on("score", (score) => {
      consumer_peer.socket.emit("consumer score", {
        consumer_id: consumer.id,
        peer_id: producer_peer.user._id,
        score
      });
    });

    consumer_peer.socket.emit("new consumer", {
      peer_id: producer_peer.user._id,
      producer_id: producer.id,
      id: consumer.id,
      kind: consumer.kind,
      rtp_parameters: consumer.rtpParameters,
      type: consumer.type,
      app_data: producer.appData,
      producer_paused: consumer.producerPaused
    });

    // await consumer.resume(); // moved to "consumer consumed" event
  }

  async leave(peer: Peer) {
    if (
      !peer.activeRoomId ||
      !this.peers.has(peer.user._id) ||
      peer.activeRoomId !== this.id
    ) {
      return;
    }

    peer.reset();
    this.peers.delete(peer.user._id);

    if (this._peers().length === 0) {
      this.router.close();
      const deleted = await roomService._delete(new Types.ObjectId(this.id));
      if (deleted) {
        this._io.emit("delete room", { room_id: this.id });
      }
      MediasoupRoom.remove(this.id);
    }
  }

  count() {
    return this._peers().length;
  }
}
