import { GetServerSideProps } from "next";
import { QueryClient, dehydrate } from "react-query";
import { api } from "../../lib/api";

export { RoomPage as default } from "../../modules/room/RoomPage";

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const queryClient = new QueryClient();
  const _id = typeof params.id === "string" ? params.id : "";

  await queryClient.prefetchQuery({
    queryFn: async () => (await api.get(`/rooms/${_id}`)).data,
    queryKey: ["room", _id]
  });

  return {
    props: {
      dehydrateState: dehydrate(queryClient)
    }
  };
};
