import { AxiosError } from "axios";
import type { ApiError, Room } from "types";
import { ErrorAlert } from "../../components/ErrorAlert";
import { Layout } from "../../components/Layout";
import { parse } from "../../utils/error";

export const RoomFetchError = ({
  room,
  error
}: {
  room?: Room;
  error: AxiosError<ApiError>;
}) => {
  return (
    <Layout>
      <ErrorAlert
        title="error! failed to fetch room"
        message={parse(error)[0]}
      />
    </Layout>
  );
};
