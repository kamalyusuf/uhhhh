import { useRouter } from "next/router";
import { useMemo } from "react";

export const useQueryParams = <T extends string>(
  paths: T[]
): { [K in T]?: string } => {
  const { query } = useRouter();

  return useMemo(() => {
    return paths.reduce((params, path) => {
      return {
        ...params,
        [path]: typeof query[path] === "string" ? query[path] : undefined
      };
    }, {});
  }, [paths, query]);
};
