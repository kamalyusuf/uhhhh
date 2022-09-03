import { AxiosError } from "axios";
import type { ApiError, Room } from "types";
import { Alert } from "../../components/Alert";
import { Layout } from "../../components/Layout";

export const RoomFetchError = ({
  room,
  error
}: {
  room?: Room;
  error: AxiosError<ApiError>;
}) => {
  return (
    <Layout>
      <Alert type="error" message={error} />
    </Layout>
  );
};
