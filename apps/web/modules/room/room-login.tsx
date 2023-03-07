import { Button, Container, Paper, PasswordInput, Stack } from "@mantine/core";
import { useState } from "react";
import type { Room } from "types";
import { Layout } from "../../components/layout";
import { useSocket } from "../../hooks/use-socket";
import { request } from "../../utils/request";
import { toast } from "react-toastify";

interface Props {
  room: Room;
  onsuccess: (success: boolean) => void;
}

export const RoomLogin = ({ room, onsuccess }: Props) => {
  const { socket } = useSocket();
  const [password, setpassword] = useState("");
  const [oking, setoking] = useState(false);

  return (
    <Layout>
      <Container>
        <Paper p={"xl"} shadow={"sm"} radius="md" style={{ width: 350 }}>
          <form
            onSubmit={async (e) => {
              e.preventDefault();

              if (!socket) return toast.error("web server is down");

              setoking(true);

              try {
                const { ok: success } = await request({
                  socket,
                  event: "room login",
                  data: {
                    room_id: room._id,
                    password
                  }
                });

                onsuccess(success);
              } catch (e) {
              } finally {
                setoking(false);
              }
            }}
          >
            <Stack>
              <PasswordInput
                label="password"
                placeholder="password"
                required
                value={password}
                onChange={(e) => setpassword(e.currentTarget.value)}
              />

              <Button type="submit" disabled={oking} loading={oking}>
                join
              </Button>
            </Stack>
          </form>
        </Paper>
      </Container>
    </Layout>
  );
};
