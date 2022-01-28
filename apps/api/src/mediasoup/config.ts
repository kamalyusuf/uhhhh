import os from "os";
import {
  WorkerLogTag,
  RtpCodecCapability,
  TransportListenIp,
  WorkerLogLevel
} from "mediasoup/node/lib/types";

export const config = {
  listen_ip: "0.0.0.0",
  listen_port: 3016,
  mediasoup: {
    workers_count: Object.keys(os.cpus()).length,
    worker: {
      rtc_min_port: 10000,
      rtc_max_port: 10100,
      log_level: "warn" as WorkerLogLevel,
      log_tags: [
        "info",
        "ice",
        "dtls",
        "rtp",
        "srtp",
        "rtcp",
        "rtx",
        "bwe",
        "score",
        "simulcast",
        "svc",
        "sctp"
      ] as WorkerLogTag[]
    },
    router: {
      media_codecs: [
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
      ] as RtpCodecCapability[]
    },
    transport: {
      listen_ips: [
        { ip: "0.0.0.0", announcedIp: "127.0.0.1" }
        // announcedIp -> server public ip
      ] as TransportListenIp[]
    }
  }
};
