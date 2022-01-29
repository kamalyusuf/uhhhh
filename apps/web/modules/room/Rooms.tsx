import { useSocketQuery } from "../../hooks/useSocketQuery";
import { Group, Center, Loader, ScrollArea } from "@mantine/core";
import { RoomCard } from "./RoomCard";
import { ErrorAlert } from "../../components/ErrorAlert";

export const Rooms = () => {
  const { data, isLoading, isError } = useSocketQuery("rooms", undefined, {
    refetchOnMount: "always",
    retry: 3
  });

  if (isLoading) {
    return (
      <Center style={{}}>
        <Loader size="lg" />
      </Center>
    );
  }

  if (!data && !isLoading && isError) {
    return <ErrorAlert message="failed to fetch rooms" />;
  }

  return (
    <ScrollArea>
      <Group direction="column" grow style={{ paddingBottom: 20 }}>
        {data?.rooms.map((room) => (
          <RoomCard key={room._id} room={room} />
        ))}
      </Group>
    </ScrollArea>
  );
};
