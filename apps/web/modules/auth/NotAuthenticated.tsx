import { useMeStore } from "../../store/me";
import { useRouter } from "next/router";
import { useEffect } from "react";

export const NotAuthenticated = ({ children }: { children: JSX.Element }) => {
  const { me } = useMeStore();
  const { replace, query } = useRouter();

  useEffect(() => {
    if (me) {
      const cb = new URLSearchParams(query as any).get("cb");
      replace(cb ? cb : "/rooms");
    }
  }, [replace, me, query]);

  if (!me) {
    return <>{children}</>;
  }

  return null;
};
