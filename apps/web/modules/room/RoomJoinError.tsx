import type { Room } from "types";
import { Alert } from "../../components/Alert";
import { Layout } from "../../components/Layout";

export const RoomJoinError = ({ room }: { room?: Room }) => {
  return (
    <Layout>
      <Alert type="error" message="could not join room" />
    </Layout>
  );
};
