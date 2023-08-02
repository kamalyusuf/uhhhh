import { Button, Container, Paper, PasswordInput, Stack } from "@mantine/core";
import { useState } from "react";
import type { Room } from "types";
import { Layout } from "../../components/_layout";
import { useSocket } from "../../hooks/use-socket";
import { request } from "../../utils/request";
import { toast } from "react-toastify";
import { micenabled } from "../../utils/mic";

interface Props {
  room: Room;
  onok: (ok: boolean) => void;
}

export const RoomLogin = ({ room, onok }: Props) => {
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

              if (!(await micenabled())) return;

              setoking(true);

              try {
                const { ok } = await request({
                  socket,
                  event: "room login",
                  payload: {
                    room_id: room._id,
                    password
                  }
                });

                onok(ok);
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
