import type { AxiosError } from "axios";
import type { GetServerSidePropsContext, GetServerSideProps } from "next";
import type { ApiError } from "types";
import { parseapierror } from "./error";

export const ssquery =
  <T extends { [key: string]: any }>(
    fn: (ctx: GetServerSidePropsContext) => Promise<{ props: T }>
  ): GetServerSideProps =>
  async (ctx) => {
    try {
      const response = await fn(ctx);

      return response;
    } catch (e) {
      const error = e as AxiosError<ApiError>;

      const { status } = parseapierror(error);

      if (!status || (status && status === 500)) throw e;

      return {
        notFound: true
      };
    }
  };
