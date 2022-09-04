import os from "os";
import { logger } from "./logger";

const ifaces = os.networkInterfaces();

export const ip = () => {
  let localIp = "127.0.0.1";

  Object.keys(ifaces).forEach((ifname) => {
    const faces = ifaces[ifname];

    if (!faces) return logger.warn(`no ifaces[ifname] - ${ifname}`);

    for (const iface of faces) {
      if (iface.family !== "IPv4" || iface.internal !== false) continue;

      localIp = iface.address;

      return;
    }
  });

  return localIp;
};

console.log({ ip: ip() });
