import { useSocketQuery } from "../../hooks/useSocketQuery";
import { Group, Center, Loader, ScrollArea } from "@mantine/core";
import { RoomCard } from "./RoomCard";
import { ErrorAlert } from "../../components/ErrorAlert";
import { c } from "../../lib/constants";

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
    return <ErrorAlert message="failed to fetch rooms" />;

  return (
    <ScrollArea
      style={{ height: 600 }}
      type="auto"
      offsetScrollbars
      styles={{ thumb: { backgroundColor: c.colors.indigo } }}
    >
      <Group direction="column" grow style={{}}>
        {data?.rooms.map((room) => (
          <RoomCard key={room._id} room={room} />
        ))}
      </Group>
    </ScrollArea>
  );
};
