import { Group, Text, Divider, Button, ScrollArea } from "@mantine/core";
import { Heading } from "../../components/Heading";
import { ToggleMuteButton } from "../audio/ToggleMuteButton";
import { c } from "../../lib/constants";
import { UserBadge } from "../user/UserBadge";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";

export const RoomPanel = () => {
  const router = useRouter();
  const [rands, setRands] = useState<string[]>([]);

  useEffect(() => {
    const run = () => {
      for (let i = 1; i <= 100; i++) {
        setRands((rands) => [...rands, Math.random().toString()]);
      }
    };
    run();
  }, []);

  return (
    <Group style={{ flex: 1 }}>
      <Group direction="column" spacing={0}>
        <Heading title="room name" order={3} />
        <Text color="indigo" size="xs">
          room description room description room description room description
          room description room description room description room description
          room description room description room description room description
          room description room description room description room description
          room description room description
        </Text>
      </Group>

      <Divider variant="solid" color="indigo" style={{ width: "100%" }} />

      <Group position="apart" style={{ width: "100%" }}>
        <ToggleMuteButton />
        <Button
          size="xs"
          radius="xl"
          variant="outline"
          color="red"
          sx={(theme) => ({
            "&:hover": {
              backgroundColor: theme.colors.dark[8]
            }
          })}
          onClick={() => router.push("/rooms")}
        >
          leave
        </Button>
      </Group>

      <Divider variant="solid" color="indigo" style={{ width: "100%" }} />

      <ScrollArea
        style={{
          height: 500
        }}
        styles={{ thumb: { backgroundColor: c.colors.indigo } }}
        type="auto"
        offsetScrollbars
      >
        <Group
          spacing={12}
          style={{
            paddingTop: 5,
            paddingBottom: 5
          }}
        >
          {rands.map((ninja) => (
            <UserBadge key={ninja} name={ninja} />
          ))}
        </Group>
      </ScrollArea>
    </Group>
  );
};
