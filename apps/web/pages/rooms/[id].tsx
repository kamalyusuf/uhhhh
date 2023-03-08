import { api } from "../../lib/api";
import { ssquery } from "../../utils/ss-query";
import axios from "axios";

export { RoomPage as default } from "../../modules/room/room-page";

export const getServerSideProps = ssquery(async ({ params }) => {
  const id = typeof params?.id === "string" ? params.id : "";

  const isdocker = process.env.NEXT_PUBLIC_ENV === "docker";

  const room = isdocker
    ? (
        await axios({
          url: `http://host.docker.internal:2300/api/rooms/${id}`
        })
      ).data
    : (await api.get(`/rooms/${id}`)).data;

  return {
    props: {
      room
    }
  };
});
