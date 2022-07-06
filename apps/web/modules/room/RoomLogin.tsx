import { Button, Container, Group, Paper, PasswordInput } from "@mantine/core";
import { useState } from "react";
import { Room } from "types";
import { Layout } from "../../components/Layout";
import { useSocket } from "../../hooks/useSocket";
import { request } from "../../utils/request";

interface Props {
  room?: Room;
  onSuccess: (success: boolean) => void;
}

export const RoomLogin = ({ room, onSuccess }: Props) => {
  const { socket } = useSocket();
  const [password, setPassword] = useState("");
  const [oking, setOking] = useState(false);

  return (
    <Layout title={`uhhhh | ${room?.name}`}>
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

                // setOk(success);
                onSuccess(success);
              } catch (e) {
              } finally {
                setOking(false);
              }
            }}
          >
            <Group direction="column" grow>
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
            </Group>
          </form>
        </Paper>
      </Container>
    </Layout>
  );
};
