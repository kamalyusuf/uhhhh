import { useUserStore } from "../../store/user";
import { useRouter } from "next/router";
import { useEffect } from "react";

const Yes = ({ children }: { children: JSX.Element }) => {
  const user = useUserStore((state) => state.user);
  const { replace } = useRouter();

  useEffect(() => {
    if (!user) replace(`/?cb=${encodeURIComponent(window.location.pathname)}`);
  }, [replace, user]);

  if (user) return <>{children}</>;

  return null;
};

const Not = ({ children }: { children: JSX.Element }) => {
  const user = useUserStore((state) => state.user);
  const { replace, query } = useRouter();

  useEffect(() => {
    if (user) {
      const cb = new URLSearchParams(query as any).get("cb");
      replace(cb ? cb : "/rooms");
    }
  }, [replace, user, query]);

  if (!user) return <>{children}</>;

  return null;
};

export const Authenticate = {
  Yes,
  Not
};
