import { useSocketQuery } from "../../hooks/use-socket-query";
import { Center, Loader, ScrollArea, Stack } from "@mantine/core";
import { RoomCard } from "./RoomCard";
import { Alert } from "../../components/Alert";
import { c } from "../../utils/constants";

export const Rooms = () => {
  const { data, isLoading, isError } = useSocketQuery("rooms", undefined, {
    refetchOnMount: "always",
    retry: 3
  });

  if (isLoading)
    return (
      <Center>
        <Loader size="lg" />
      </Center>
    );

  if (!data && !isLoading && isError)
    return <Alert type="error" message="failed to fetch rooms" />;

  return (
    <ScrollArea
      style={{ height: 600 }}
      type="auto"
      offsetScrollbars
      styles={{ thumb: { backgroundColor: c.colors.indigo } }}
    >
      <Stack>
        {data?.rooms.map((room) => (
          <RoomCard key={room._id} room={room} />
        ))}
      </Stack>
    </ScrollArea>
  );
};
