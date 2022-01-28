import { Peer } from "./peer";
import { Router, RtpCapabilities } from "mediasoup/node/lib/types";
import { EventEmitter } from "events";
import { config } from "./config";
import { workers } from "./workers";
import { RoomDoc } from "../modules/rooms/room.model";
import { NotFoundError } from "@kamalyb/errors";

declare global {
  var ms: MediasoupRoom;
}

export class MediasoupRoom extends EventEmitter {
  static rooms: Map<string, MediasoupRoom> = new Map();

  public id: string;
  private peers: Map<string, Peer>;
  private router: Router;

  static async create({ id, db_room }: { id: string; db_room: RoomDoc }) {
    const router = await workers.next().createRouter({
      mediaCodecs: config.mediasoup.router.media_codecs
    });

    const room = new MediasoupRoom({ id, router, db_room });
    this.rooms.set(room.id, room);
    return room;
  }

  static find() {
    return this.rooms;
  }

  private constructor({
    id,
    router,
    db_room
  }: {
    id: string;
    router: Router;
    db_room: RoomDoc;
  }) {
    super();
    this.setMaxListeners(Infinity);

    this.id = id;
    this.router = router;

    this.peers = new Map();
  }

  get rtpCapabilities(): RtpCapabilities {
    return this.router.rtpCapabilities;
  }

  addPeer({
    id,
    name,
    rtpCapabilities
  }: {
    id: string;
    name: string;
    rtpCapabilities: RtpCapabilities;
  }) {
    if (this.peers.has(id)) {
      throw new Error(`peer with '${id}' already exists`);
    }

    const broadcaster = new Peer({ id, name, rtpCapabilities });

    this.peers.set(broadcaster.id, broadcaster);

    // TODO: notify the new broadcaster to all peers in the room
  }

  static findById(id: string) {
    const room = this.rooms.get(id);
    if (!room) {
      throw new NotFoundError("no room found");
    }

    return room;
  }
}
