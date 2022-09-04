import { Button, Container, Paper, PasswordInput, Stack } from "@mantine/core";
import { useState } from "react";
import type { Room } from "types";
import { Layout } from "../../components/Layout";
import { useSocket } from "../../hooks/use-socket";
import { request } from "../../utils/request";

interface Props {
  room: Room;
  onSuccess: (success: boolean) => void;
}

export const RoomLogin = ({ room, onSuccess }: Props) => {
  const { socket } = useSocket();
  const [password, setPassword] = useState("");
  const [oking, setOking] = useState(false);

  return (
    <Layout>
      <Container>
        <Paper p={"xl"} shadow={"sm"} radius="md" style={{ width: 350 }}>
          <form
            onSubmit={async (e) => {
              e.preventDefault();

              setOking(true);

              try {
                const { ok: success } = await request({
                  socket,
                  event: "room login",
                  payload: {
                    room_id: room._id,
                    password
                  }
                });

                onSuccess(success);
              } catch (e) {
              } finally {
                setOking(false);
              }
            }}
          >
            <Stack>
              <PasswordInput
                label="password"
                placeholder="password"
                required
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
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
