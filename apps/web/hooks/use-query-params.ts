import { useRouter } from "next/router";
import { useMemo } from "react";

export const useQueryParams = (path: string): string | undefined => {
  const { query } = useRouter();
  const value = useMemo(() => query[path], [path, query]);

  return value as string | undefined;
};
