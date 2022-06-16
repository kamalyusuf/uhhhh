import { useMeStore } from "../../store/me";
import { useRouter } from "next/router";
import { useEffect } from "react";

export const Authenticate = ({ children }: { children: JSX.Element }) => {
  const { me } = useMeStore();
  const { replace } = useRouter();

  useEffect(() => {
    if (!me) replace(`/?cb=${encodeURIComponent(window.location.pathname)}`);
  }, [replace, me]);

  if (me) return <>{children}</>;

  return null;
};
