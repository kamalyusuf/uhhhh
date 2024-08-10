import os from "node:os";
import { logger } from "../lib/logger.js";

const ifaces = os.networkInterfaces();

export const ip = () => {
  let local = "127.0.0.1";

  Object.keys(ifaces).forEach((ifname) => {
    const faces = ifaces[ifname];

    if (!faces) return logger.warn(`no ifaces[ifname] - ${ifname}`);

    for (const iface of faces) {
      if (iface.family !== "IPv4" || iface.internal !== false) continue;

      local = iface.address;

      return;
    }
  });

  return local;
};

console.log({ ip: ip() });
