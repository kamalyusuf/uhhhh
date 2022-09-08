import { Peer } from "./peer";
import {
  Router,
  type RtpCapabilities,
  Producer,
  Consumer
} from "mediasoup/node/lib/types";
import { EventEmitter } from "events";
import { workers } from "./workers";
import { NotFoundError } from "@kamalyb/errors";
import type { TypedIO } from "../socket/types";
import { logger } from "../../lib/logger";
import { RoomVisibility } from "types";
import type { RoomDoc } from "../room/room.model";

export class MediasoupRoom extends EventEmitter {
  private static _rooms: Map<string, MediasoupRoom> = new Map();

  public id: string; // = _doc._id.toString()
  public peers: Map<string, Peer>;
  public router: Router;
  public in_session_at?: Date;

  private _io: TypedIO;
  private _doc: RoomDoc;

  private constructor({
    id,
    router,
    io,
    doc
  }: {
    id: string;
    router: Router;
    io: TypedIO;
    doc: RoomDoc;
  }) {
    super();
    this.setMaxListeners(Infinity);

    this.id = id;
    this.router = router;
    this._io = io;
    this._doc = doc;

    this.peers = new Map<string, Peer>();
  }

  static async create({
    id,
    io,
    doc
  }: {
    id: string;
    io: TypedIO;
    doc: RoomDoc;
  }) {
    const router = await workers.next().createRouter({
      mediaCodecs: [
        {
          kind: "audio",
          mimeType: "audio/opus",
          clockRate: 48000,
          channels: 2
        },
        {
          kind: "video",
          mimeType: "video/VP8",
          clockRate: 90000,
          parameters: {
            "x-google-start-bitrate": 1000
          }
        }
      ]
    });

    const room = new MediasoupRoom({ id, router, io, doc });

    this._rooms.set(room.id, room);

    return room;
  }

  static find() {
    const rooms = [];

    for (const room of this._rooms.values())
      rooms.push({ ...room._doc.toJSON(), members: room.users() });

    return rooms;
  }

  static findById(room_id: string) {
    const room = this._rooms.get(room_id);

    if (!room) throw new NotFoundError("no mediasoup room found");

    return room;
  }

  static async findOrCreate(
    room_id: string,
    io: TypedIO,
    doc: RoomDoc
  ): Promise<MediasoupRoom> {
    const room = this._rooms.get(room_id);

    if (room) return room;

    return this.create({ id: room_id, io, doc });
  }

  static remove(room_id: string) {
    this._rooms.delete(room_id);
  }

  get rtpCapabilities(): RtpCapabilities {
    return this.router.rtpCapabilities;
  }

  join(peer: Peer) {
    if (this.peers.has(peer.user._id)) throw new Error("peer already joined");

    if (!this.count()) this.in_session_at = new Date();

    peer.socket.emit("room session at", {
      in_session_at: this.in_session_at?.toISOString() || ""
    });

    this.peers.set(peer.user._id, peer);

    if (this._doc.visibility === RoomVisibility.PUBLIC)
      this._io.emit("update room members count", {
        room_id: this.id,
        members_count: this.count()
      });
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
    if (!consumer_peer.rtp_capabilities)
      return logger.warn(
        `[createConsumer()] ${consumer_peer.user.display_name} does not have rtpCapabilities. returning`
      );

    if (
      !this.router.canConsume({
        producerId: producer.id,
        rtpCapabilities: consumer_peer.rtp_capabilities
      })
    )
      return logger.warn(
        `[createConsumer()] router cannot consume ${consumer_peer.user.display_name}'s rtpCapabilities or maybe the producer with id ${producer.id}. returning`
      );

    const transports = Array.from(consumer_peer.transports.values());
    const transport = transports.find((t) => t.appData.direction === "receive");

    if (!transport)
      return logger.warn(
        `[createConsumer()] transport not found for consumer_peer ${consumer_peer.user.display_name}`
      );

    let consumer: Consumer;

    try {
      consumer = await transport.consume({
        producerId: producer.id,
        rtpCapabilities: consumer_peer.rtp_capabilities,
        paused: true
      });
    } catch (e) {
      const error = e as Error;

      logger.warn(
        `[createConsumer() -> transport.consume()] ${error.message} for consumer_peer ${consumer_peer.user.display_name} and producer_peer ${producer_peer.user.display_name}`
      );

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
      !peer.active_room_id ||
      !this.peers.has(peer.user._id) ||
      peer.active_room_id !== this.id
    )
      return;

    peer.reset();
    this.peers.delete(peer.user._id);

    if (this._doc.visibility === RoomVisibility.PUBLIC)
      this._io.emit("update room members count", {
        room_id: this.id,
        members_count: this.count()
      });

    if (this._peers().length === 0) {
      this.router.close();

      const deleted = await deps.room.delete(this.id);

      if (deleted && this._doc.visibility === RoomVisibility.PUBLIC)
        this._io.emit("delete room", { room_id: this.id });

      MediasoupRoom.remove(this.id);
    }
  }

  count() {
    return this._peers().length;
  }
}
