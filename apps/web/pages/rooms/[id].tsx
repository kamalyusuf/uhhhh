import { GetServerSideProps } from "next";

export { RoomPage as default } from "../../modules/room/RoomPage";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return {
    props: {}
  };
};
