import { useMeStore } from "../../store/me";
import { useRouter } from "next/router";
import { useEffect } from "react";

export const NotAuthenticated = ({ children }: { children: JSX.Element }) => {
  const { me } = useMeStore();
  const { replace } = useRouter();

  useEffect(() => {
    if (me) {
      replace("/rooms");
    }
  }, [replace, me]);

  if (!me) {
    return <>{children}</>;
  }

  return null;
};
