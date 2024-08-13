import { useSocketQuery } from "../../hooks/use-socket-query";
import { Center, Loader, ScrollArea, Stack } from "@mantine/core";
import { RoomCard } from "./room-card";
import { Alert } from "../../components/alert";
import { useSocket } from "../socket/socket-provider";

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
        message="web server is down"
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
        type="auto"
        offsetScrollbars
        styles={{ thumb: { backgroundColor: "var(--color-primary)" } }}
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
