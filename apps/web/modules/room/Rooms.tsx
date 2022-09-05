import { useSocketQuery } from "../../hooks/use-socket-query";
import { Center, Loader, ScrollArea, Stack } from "@mantine/core";
import { RoomCard } from "./RoomCard";
import { Alert } from "../../components/Alert";
import { c } from "../../utils/constants";
import { useSocket } from "../../hooks/use-socket";

export const Rooms = () => {
  const { connected, connecting } = useSocket();
  const {
    data,
    isFetching: isLoading,
    isError
  } = useSocketQuery({
    event: "rooms",
    payload: {}
  });

  if (connecting)
    return (
      <Center>
        <Loader size="lg" />
      </Center>
    );

  if (!connected)
    return (
      <Alert
        type="error"
        message="webserver is down"
        style={{ marginTop: 20 }}
      />
    );

  if (isLoading)
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
