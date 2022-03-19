import {
  Group,
  Text,
  ThemeIcon,
  Button,
  Modal,
  TextInput
} from "@mantine/core";
import { Room } from "types";
import { Heading } from "../../components/Heading";
import { MdRoom } from "react-icons/md";
import { GoPrimitiveDot } from "react-icons/go";
import { useRouter } from "next/router";
import React, { useState } from "react";

interface Props {
  room: Room;
}

export const RoomCard = ({ room }: Props) => {
  const router = useRouter();
  const [opened, setOpened] = useState(false);

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
        <Group direction="column" spacing={0}>
          <Heading title={room.name} order={3} />
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
              <GoPrimitiveDot />
            </ThemeIcon>
            <Text color="white" size="sm">
              {room.members_count}
            </Text>
          </Group>
          <Text color="indigo" size="sm" style={{ fontStyle: "italic" }}>
            created by: {room.creator.display_name}
          </Text>
        </Group>
      </Group>
      <Button
        size="sm"
        radius="xl"
        onClick={() => router.push(`/rooms/${room._id}`)}
      >
        join
      </Button>
    </Group>
  );
};
