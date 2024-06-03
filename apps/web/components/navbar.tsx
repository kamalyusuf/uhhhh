import { Group, Box, Button, Title } from "@mantine/core";
import Link from "next/link";
import { Container } from "./container";
import { HiUser } from "react-icons/hi";
import { useUserStore } from "../store/user";
import { useRouter } from "next/router";
import { useRoomStore } from "../store/room";

export const NavBar = () => {
  const user = useUserStore((state) => state.user);
  const router = useRouter();
  const state = useRoomStore((state) => state.state);

  return (
    <Box
      style={{
        width: "100%",
        paddingTop: 20,
        paddingBottom: 20
      }}
    >
      <Container>
        <Group justify="space-between" align="center">
          <Link href="/" legacyBehavior passHref scroll={false}>
            <Title
              order={2}
              style={{
                cursor: "pointer",
                pointerEvents: state === "connected" ? "none" : undefined
              }}
            >
              uhhhh
            </Title>
          </Link>

          {!!user && (
            <Button
              rightSection={<HiUser />}
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
