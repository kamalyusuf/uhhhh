import { Group, Text, ThemeIcon, Button, Stack, Title } from "@mantine/core";
import { type Room, RoomStatus } from "types";
import { MdRoom } from "react-icons/md";
import { GoDotFill } from "react-icons/go";
import { useRouter } from "next/router";
import { IoMdLock } from "react-icons/io";
import { micenabled } from "../../utils/mic";

interface Props {
  room: Room;
}

export const RoomCard = ({ room }: Props) => {
  const router = useRouter();

  return (
    <Group position="apart" align="center">
      <Group align="baseline">
        <ThemeIcon
          variant="light"
          style={{ backgroundColor: "transparent" }}
          size="sm"
        >
          <MdRoom />
        </ThemeIcon>
        <Stack spacing={0}>
          <Group align="center">
            <Title order={3}>{room.name}</Title>
            {room.status === RoomStatus.PROTECTED ? (
              <ThemeIcon
                variant="light"
                style={{
                  backgroundColor: "transparent",
                  color: "gold"
                }}
                size="sm"
              >
                <IoMdLock />
              </ThemeIcon>
            ) : null}
          </Group>
          <Text color="indigo" size="sm">
            {room.description}
          </Text>
          <Group align="center" spacing={10}>
            <ThemeIcon
              variant="light"
              style={{ backgroundColor: "transparent" }}
              size="sm"
              color="red"
            >
              <GoDotFill />
            </ThemeIcon>
            <Text color="white" size="sm">
              {room.members_count}
            </Text>
          </Group>
          <Text color="indigo" size="sm" style={{ fontStyle: "italic" }}>
            created by: {room.creator.display_name}
          </Text>
        </Stack>
      </Group>

      <Button
        size="sm"
        radius="xl"
        onClick={async () => {
          if (!(await micenabled())) return;

          router.push(`/rooms/${room._id}`);
        }}
      >
        join
      </Button>
    </Group>
  );
};
