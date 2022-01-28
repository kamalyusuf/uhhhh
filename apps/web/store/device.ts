import { detectDevice, Device } from "mediasoup-client";
import create from "zustand";
import { combine, devtools } from "zustand/middleware";

export const getDevice = () => {
  try {
    let handlerName = detectDevice();
    if (!handlerName) {
      handlerName = "Chrome74";
    }
    return new Device({ handlerName });
  } catch {
    return null;
  }
};

const store = combine(
  {
    device: getDevice()
  },
  (set) => ({
    set
  })
);

export const useDeviceStore = create(devtools(store, { name: "DeviceStore" }));
