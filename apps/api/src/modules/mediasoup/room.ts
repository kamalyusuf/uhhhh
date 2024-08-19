import type { Peer } from "./peer.js";
import type { Router, Producer, Consumer } from "mediasoup/node/lib/types.js";
import { workers } from "./workers.js";
import { NotFoundError } from "@kamalyb/errors";
import type { TypedIO } from "../socket/types.js";
import { logger } from "../../lib/logger.js";
import { Room } from "../room/room.model.js";

export class MediasoupRoom {
  private static rooms: Map<string, MediasoupRoom> = new Map();

  public id: string;
  public peers: Map<string, Peer>;
  public router: Router;
  public in_session_at?: Date;

  private io: TypedIO;
  private doc: Room;

  private constructor({
    router,
    io,
    doc
  }: {
    router: Router;
    io: TypedIO;
    doc: Room;
  }) {
    this.id = doc._id.toString();
    this.router = router;
    this.io = io;
    this.doc = doc;

    this.peers = new Map<string, Peer>();
  }

  static async create({ io, doc }: { io: TypedIO; doc: Room }) {
    const worker = workers.next();

    if (!worker) throw new Error("unable to get next worker");

    const router = await worker.createRouter({
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

  static findbyid(room_id: string): MediasoupRoom {
    const room = this.rooms.get(room_id);

    if (!room) throw new NotFoundError("mediasoup room not found");

    return room;
  }

  static findbyidsafe(room_id: string): MediasoupRoom | undefined {
    return this.rooms.get(room_id);
  }

  static async findorcreate(io: TypedIO, doc: Room): Promise<MediasoupRoom> {
    const room = this.rooms.get(doc._id);

    if (room) return room;

    return this.create({ io, doc });
  }

  static remove(room_id: string): boolean {
    return this.rooms.delete(room_id);
  }

  get rtpcapabilities() {
    return this.router.rtpCapabilities;
  }

  get members_count() {
    return this.peers.size;
  }

  join(peer: Peer): void {
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

  findpeers({ except }: { except?: string } = { except: undefined }): Peer[] {
    return Array.from(this.peers.values()).filter(
      (peer) => peer.user._id !== except
    );
  }

  has(peer_id: string): boolean {
    return this.peers.has(peer_id);
  }

  async createconsumer({
    consumer_peer: consumerpeer,
    producer_peer: producerpeer,
    producer
  }: {
    consumer_peer: Peer;
    producer_peer: Peer;
    producer: Producer;
  }): Promise<void> {
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
        enableRtx: true,
        ignoreDtx: true
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

  async leave(peer: Peer): Promise<void> {
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

      const deleted = Room.delete(this.id);

      if (deleted) {
        if (this.doc.ispublic())
          this.io.emit("delete room", { room_id: this.id });
        else peer.socket.emit("delete room", { room_id: this.id });
      }

      MediasoupRoom.remove(this.id);
    }

    peer.socket.leave(this.id);
    peer.socket.to(this.id).emit("peer left", { peer: peer.user });
  }
}
