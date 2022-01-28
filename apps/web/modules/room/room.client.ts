import { Device } from "mediasoup-client";
import { Consumer, Producer, Transport } from "mediasoup-client/lib/types";
import { Socket } from "socket.io-client";
import { useRoomStore } from "../../store/room";

interface CreateRoomClient {
  id: string;
  peer_id: string;
  device: Record<string, string>;
  produce: boolean;
  consume: boolean;
  handler_name: string;
}

export class RoomClient {
  public id: string;
  public peer_id: string;
  public device: Record<string, string>;
  public closed: boolean;
  public produce: boolean;
  public consume: boolean;
  public handler_name: string;
  public ws_url: string;
  public socket: Socket;
  public send_transport: Transport;
  public receive_transport: Transport;
  public mic_producer: Producer;
  public consumers: Map<string, Consumer>;
  public mediasoup_device: Device;

  constructor({
    id,
    peer_id,
    device,
    produce,
    consume,
    handler_name
  }: CreateRoomClient) {
    this.closed = false;

    this.id = id;
    this.peer_id = peer_id;
    this.device = device;
    this.produce = produce;
    this.consume = consume;
    this.handler_name = handler_name;

    this.ws_url = process.env.NEXT_PUBLIC_API_URL;
    this.socket = null;
    this.mediasoup_device = null;
    this.send_transport = null;
    this.receive_transport = null;
    this.mic_producer = null;
    this.consumers = new Map();
  }

  close() {
    if (this.closed) return;

    this.closed = true;

    if (this.send_transport) this.send_transport.close();
    if (this.receive_transport) this.receive_transport.close();

    useRoomStore.getState().setState("closed");
  }
}
