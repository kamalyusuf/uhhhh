import { parseapierror } from "./error";
import type { AxiosError } from "axios";
import type { GetServerSidePropsContext, GetServerSideProps } from "next";
import type { ApiError } from "types";

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

      if (status === 404) return { notFound: true };

      throw e;
    }
  };
