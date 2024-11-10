import Link from "next/link";
import { Group, Box, Button, Title } from "@mantine/core";
import { Container } from "./container";
import { useUserStore } from "../store/user";
import { useRouter } from "next/router";
import { useRoomStore } from "../store/room";

export const NavBar = () => {
  const user = useUserStore((state) => state.user);
  const router = useRouter();
  const state = useRoomStore((state) => state.state);

  return (
    <Box py={20}>
      <Container>
        <Group justify="space-between" align="center">
          <Link href="/" legacyBehavior passHref scroll={false}>
            <Title
              className="cursor-pointer"
              style={{
                pointerEvents: state === "connected" ? "none" : undefined
              }}
            >
              uhhhh
            </Title>
          </Link>

          {!!user && (
            <Button
              size="sm"
              onClick={() => router.push("/settings")}
              style={{
                pointerEvents: state === "connected" ? "none" : undefined
              }}
            >
              {user.display_name}
            </Button>
          )}
        </Group>
      </Container>
    </Box>
  );
};
