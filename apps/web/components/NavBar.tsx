import { Group, Box, Button } from "@mantine/core";
import { Heading } from "./Heading";
import Link from "next/link";
import { Container } from "./Container";
import { HiUser } from "react-icons/hi";
import { useMeStore } from "../store/me";
import { useRouter } from "next/router";
import { useRoomStore } from "../store/room";

export const NavBar = () => {
  const { me } = useMeStore();
  const router = useRouter();
  const { state } = useRoomStore();

  return (
    <Box
      sx={(theme) => ({
        width: "100%",
        paddingTop: 20,
        paddingBottom: 20
      })}
    >
      <Container>
        <Group position="apart" align="center">
          <Link href="/">
            <Heading
              title="uhhhh"
              color="indigo"
              style={{
                cursor: "pointer",
                pointerEvents: state === "connected" ? "none" : undefined
              }}
            />
          </Link>

          {me && (
            <Button
              rightIcon={<HiUser />}
              size="sm"
              onClick={() => router.push("/me")}
              style={{
                pointerEvents: state === "connected" ? "none" : undefined
              }}
            >
              {me.display_name}
            </Button>
          )}
        </Group>
      </Container>
    </Box>
  );
};
