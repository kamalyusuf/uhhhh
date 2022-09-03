import type { EventError, Room } from "types";
import { Alert } from "../../components/Alert";
import { Layout } from "../../components/Layout";

export const RoomFetchError = ({
  room,
  error
}: {
  room?: Room;
  error: EventError;
}) => {
  return (
    <Layout>
      <Alert type="error" message={error} />
    </Layout>
  );
};
