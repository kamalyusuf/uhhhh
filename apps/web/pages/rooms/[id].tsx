import type { Room } from "types";
import { api } from "../../lib/api";
import { ssQuery } from "../../utils/ss-query";

export { RoomPage as default } from "../../modules/room/RoomPage";

export const getServerSideProps = ssQuery(async ({ params }) => {
  const id = typeof params.id === "string" ? params.id : "";

  const room = (await api.get<Room>(`/rooms/${id}`)).data;

  return {
    props: {
      room
    }
  };
});
