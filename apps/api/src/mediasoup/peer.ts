import { Socket } from "socket.io";
import {
  Producer,
  Consumer,
  Transport,
  RtpCapabilities
} from "mediasoup/node/lib/types";

export class Peer {
  public id: string;
  public name: string;
  public rtpCapabilities: RtpCapabilities;
  public producers: Map<string, Producer>;
  public consumers: Map<string, Consumer>;
  public transports: Map<string, Transport>;

  constructor({
    id,
    name,
    rtpCapabilities
  }: {
    id: string;
    name: string;
    rtpCapabilities: RtpCapabilities;
  }) {
    this.id = id;
    this.name = name;
    this.rtpCapabilities = rtpCapabilities;

    this.producers = new Map();
    this.consumers = new Map();
    this.transports = new Map();
  }
}
