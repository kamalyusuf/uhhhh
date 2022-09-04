import { AxiosError } from "axios";
import type { GetServerSidePropsContext, GetServerSideProps } from "next";
import type { ApiError } from "types";
import { parse } from "./error";

export const ssQuery =
  <T extends { [key: string]: any }>(
    fn: (ctx: GetServerSidePropsContext) => Promise<{ props: T }>
  ): GetServerSideProps =>
  async (ctx) => {
    try {
      const response = await fn(ctx);

      return response;
    } catch (e) {
      const error = e as AxiosError<ApiError>;

      const { status } = parse(error);

      if (status === 500) throw e;

      return {
        notFound: true
      };
    }
  };
