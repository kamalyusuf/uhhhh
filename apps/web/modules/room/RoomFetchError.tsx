import { AxiosError } from "axios";
import { ApiError, Room } from "types";
import { ErrorAlert } from "../../components/ErrorAlert";
import { Layout } from "../../components/Layout";
import { parseApiError } from "../../utils/error";

export const RoomFetchError = ({
  room,
  error
}: {
  room?: Room;
  error: AxiosError<ApiError>;
}) => {
  return (
    <Layout title={`uhhhh | ${room?.name ?? "room"}`}>
      <ErrorAlert
        title="uh-oh! failed to fetch room"
        message={parseApiError(error)[0]}
      />
    </Layout>
  );
};
