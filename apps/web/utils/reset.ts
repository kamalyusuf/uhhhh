import { useMicStore } from "../store/mic";
import { usePeerStore } from "../store/peer";
import { useProducerStore } from "../store/producer";
import { useRoomStore, type RoomStore } from "../store/room";
import { useRoomChatStore } from "../store/room-chat";
import { useTransportStore } from "../store/transport";
import type { State } from "../types";

export const reset = (state: { room?: State<RoomStore> } = {}): void => {
  useMicStore.getState().reset();
  useTransportStore.getState().reset();
  useProducerStore.getState().reset();
  usePeerStore.getState().reset();
  useRoomStore.getState().reset(state.room);
  useRoomChatStore.getState().reset();
};
