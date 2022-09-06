import type { Room } from "types";
import { api } from "../../lib/api";
import { ssQuery } from "../../utils/ss-query";
import axios from "axios";

export { RoomPage as default } from "../../modules/room/RoomPage";

export const getServerSideProps = ssQuery(async ({ params }) => {
  const id = typeof params.id === "string" ? params.id : "";

  const isDocker = process.env.ENV === "docker";

  const room: Room = isDocker
    ? (
        await axios({
          url: `http://host.docker.internal:5000/api/rooms/${id}`
        })
      ).data
    : (await api.get(`/rooms/${id}`)).data;

  return {
    props: {
      room
    }
  };
});
