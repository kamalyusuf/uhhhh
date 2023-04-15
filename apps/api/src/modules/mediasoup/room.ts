import type { Peer } from "./peer";
import type { Router, Producer, Consumer } from "mediasoup/node/lib/types";
import { workers } from "./workers";
import { NotFoundError } from "@kamalyb/errors";
import type { TypedIO } from "../socket/types";
import { logger } from "../../lib/logger";
import { Room, type RoomDocument } from "../room/room.model";

export class MediasoupRoom {
  private static rooms: Map<string, MediasoupRoom> = new Map();

  public id: string;
  public peers: Map<string, Peer>;
  public router: Router;
  public in_session_at?: Date;

  private io: TypedIO;
  private doc: RoomDocument;

  private constructor({
    router,
    io,
    doc
  }: {
    router: Router;
    io: TypedIO;
    doc: RoomDocument;
  }) {
    this.id = doc._id.toString();
    this.router = router;
    this.io = io;
    this.doc = doc;

    this.peers = new Map<string, Peer>();
  }

  static async create({ io, doc }: { io: TypedIO; doc: RoomDocument }) {
    const router = await workers.next().createRouter({
      mediaCodecs: [
        {
          kind: "audio",
          mimeType: "audio/opus",
          clockRate: 48000,
          channels: 2
        }
      ]
    });

    const room = new MediasoupRoom({
      router,
      io,
      doc
    });

    this.rooms.set(room.id, room);

    return room;
  }

  static find() {
    const rooms = [];

    for (const room of this.rooms.values())
      rooms.push({
        ...room.doc.toJSON(),
        members: room.findusers()
      });

    return rooms;
  }

  static findbyid(room_id: string) {
    const room = this.rooms.get(room_id);

    if (!room) throw new NotFoundError("mediasoup room not found");

    return room;
  }

  static async findorcreate(
    io: TypedIO,
    doc: RoomDocument
  ): Promise<MediasoupRoom> {
    const room = this.rooms.get(doc._id.toString());

    if (room) return room;

    return this.create({ io, doc });
  }

  static remove(room_id: string) {
    this.rooms.delete(room_id);
  }

  get rtpcapabilities() {
    return this.router.rtpCapabilities;
  }

  get members_count() {
    return this.peers.size;
  }

  join(peer: Peer) {
    if (this.peers.has(peer.user._id)) throw new Error("already joined");

    if (!this.members_count) this.in_session_at = new Date();

    peer.notify("room session at", [
      {
        in_session_at: this.in_session_at?.toISOString() ?? ""
      }
    ]);

    this.peers.set(peer.user._id, peer);

    if (this.doc.ispublic())
      this.io.emit("update room members count", {
        room_id: this.id,
        members_count: this.members_count
      });
  }

  findusers({ except }: { except?: string } = { except: undefined }) {
    return Array.from(this.peers.values())
      .map((peer) => peer.user)
      .filter((peer) => peer._id !== except);
  }

  findpeers({ except }: { except?: string } = { except: undefined }) {
    return Array.from(this.peers.values()).filter(
      (peer) => peer.user._id !== except
    );
  }

  has(id: string) {
    return this.peers.has(id);
  }

  async createconsumer({
    consumer_peer: consumerpeer,
    producer_peer: producerpeer,
    producer
  }: {
    consumer_peer: Peer;
    producer_peer: Peer;
    producer: Producer;
  }) {
    if (!consumerpeer.rtp_capabilities)
      return logger.warn(
        `[createconsumer()] ${consumerpeer.user.display_name} does not have rtp capabilities`
      );

    if (
      !this.router.canConsume({
        producerId: producer.id,
        rtpCapabilities: consumerpeer.rtp_capabilities
      })
    )
      return logger.warn(
        `[createconsumer()] router cannot consume rtp capabilities`
      );

    const transports = Array.from(consumerpeer.transports.values());
    const transport = transports.find((t) => t.appData.direction === "receive");

    if (!transport)
      return logger.warn(`[createconsumer()] transport not found`);

    let consumer: Consumer;

    try {
      consumer = await transport.consume({
        producerId: producer.id,
        rtpCapabilities: consumerpeer.rtp_capabilities,
        paused: true,
        enableRtx: true
      });
    } catch (e) {
      const error = e as Error;

      return logger.warn(
        `[createconsumer()] cannot consume transport. ${error.message}`
      );
    }

    consumerpeer.consumers.set(consumer.id, consumer);

    consumer.on("transportclose", () => {
      consumerpeer.consumers.delete(consumer.id);
    });

    consumer.on("producerclose", () => {
      consumerpeer.consumers.delete(consumer.id);
      consumerpeer.notify("consumer closed", [
        {
          consumer_id: consumer.id,
          peer_id: producerpeer.user._id
        }
      ]);
    });

    consumer.on("producerpause", () => {
      consumerpeer.notify("consumer paused", [
        {
          consumer_id: consumer.id,
          peer_id: producerpeer.user._id
        }
      ]);
    });

    consumer.on("producerresume", () => {
      consumerpeer.notify("consumer resumed", [
        {
          consumer_id: consumer.id,
          peer_id: producerpeer.user._id
        }
      ]);
    });

    consumer.on("score", (score) => {
      consumerpeer.notify("consumer score", [
        {
          consumer_id: consumer.id,
          peer_id: producerpeer.user._id,
          score
        }
      ]);
    });

    consumerpeer.notify("new consumer", [
      {
        peer_id: producerpeer.user._id,
        producer_id: producer.id,
        id: consumer.id,
        kind: consumer.kind,
        rtp_parameters: consumer.rtpParameters,
        type: consumer.type,
        app_data: producer.appData,
        producer_paused: consumer.producerPaused
      }
    ]);

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

    if (this.doc.ispublic())
      this.io.emit("update room members count", {
        room_id: this.id,
        members_count: this.members_count
      });

    if (this.members_count === 0) {
      this.router.close();

      const deleted = await Room.delete(this.id);

      if (deleted && this.doc.ispublic())
        this.io.emit("delete room", { room_id: this.id });

      MediasoupRoom.remove(this.id);
    }
  }
}
