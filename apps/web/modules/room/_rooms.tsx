import { useSocketQuery } from "../../hooks/use-socket-query";
import { Center, Loader, ScrollArea, Stack } from "@mantine/core";
import { RoomCard } from "./room-card";
import { Alert } from "../../components/_alert";
import { c } from "../../utils/constants";
import { useSocket } from "../../modules/socket/socket-provider";

export const Rooms = () => {
  const { state } = useSocket();
  const { data, isFetching, isError } = useSocketQuery("rooms");

  if (state === "connecting")
    return (
      <Center>
        <Loader size="lg" />
      </Center>
    );

  if (state !== "connected")
    return (
      <Alert
        type="error"
        message="webserver is down"
        style={{ marginTop: 20 }}
      />
    );

  if (isFetching)
    return (
      <Center>
        <Loader size="lg" />
      </Center>
    );

  if (isError)
    return (
      <Alert
        type="error"
        message="failed to fetch rooms"
        style={{ marginTop: 20 }}
      />
    );

  if (data)
    return (
      <ScrollArea
        style={{ height: 600 }}
        type="auto"
        offsetScrollbars
        styles={{ thumb: { backgroundColor: c.colors.indigo } }}
      >
        <Stack>
          {data.rooms.map((room) => (
            <RoomCard key={room._id} room={room} />
          ))}
        </Stack>
      </ScrollArea>
    );

  return null;
};
