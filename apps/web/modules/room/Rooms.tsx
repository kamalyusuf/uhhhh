import { useSocketQuery } from "../../hooks/useSocketQuery";
import { Group, Center, Loader } from "@mantine/core";
import { RoomCard } from "./RoomCard";

export const Rooms = () => {
  const { data, isLoading } = useSocketQuery("rooms", undefined, {
    refetchOnMount: "always"
  });

  return (
    <Group direction="column" grow>
      {isLoading ? (
        <Center style={{}}>
          <Loader size="lg" />
        </Center>
      ) : (
        data?.rooms.map((room) => <RoomCard key={room._id} room={room} />)
      )}
    </Group>
  );
};
