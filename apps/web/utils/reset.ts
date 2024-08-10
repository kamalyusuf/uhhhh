import { useMicStore } from "../store/mic";
import { usePeerStore } from "../store/peer";
import { useProducerStore } from "../store/producer";
import { useRoomStore, type RoomState } from "../store/room";
import { useRoomChatStore } from "../store/room-chat";
import { useTransportStore } from "../store/transport";

export const reset = (state?: RoomState): void => {
  useMicStore.getState().reset();
  useTransportStore.getState().reset();
  useProducerStore.getState().reset();
  usePeerStore.getState().reset();
  useRoomStore.getState().reset(state);
  useRoomChatStore.getState().reset();
};
