import { Room } from "types";
import { ErrorAlert } from "../../components/ErrorAlert";
import { Layout } from "../../components/Layout";

export const RoomJoinError = ({ room }: { room?: Room }) => {
  return (
    <Layout title={`uhhhh | ${room?.name ?? "room"}`}>
      <ErrorAlert
        title="uh-oh! failed to establish websocket connection"
        message="could not join room"
      />
    </Layout>
  );
};
