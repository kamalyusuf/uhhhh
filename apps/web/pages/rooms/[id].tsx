import { api } from "../../lib/api";
import { ssquery } from "../../utils/ss-query";

export { RoomPage as default } from "../../modules/room/room-page";

export const getServerSideProps = ssquery(async ({ params }) => {
  const id = typeof params?.id === "string" ? params.id : "";

  return {
    props: {
      room: (await api.get(`/rooms/${id}`)).data
    }
  };
});
