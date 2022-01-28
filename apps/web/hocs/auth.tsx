import { useRouter } from "next/router";
import { useEffect } from "react";
import { useMeStore } from "../store/me";
import { PageComponent } from "../types";

export const withAuth =
  (Component: any): PageComponent =>
  (props: any) => {
    const { me } = useMeStore();
    const { replace } = useRouter();

    useEffect(() => {
      if (!me) {
        replace(`/`);
      }
    }, [replace, me]);

    if (me) {
      return <Component {...props} />;
    }

    return null;
  };

export const withNoAuth =
  (Component: any): PageComponent =>
  (props: any) => {
    const { me } = useMeStore();
    const { replace } = useRouter();

    useEffect(() => {
      if (me) {
        replace("/rooms");
      }
    }, [replace, me]);

    if (!me) {
      return <Component {...props} />;
    }

    return null;
  };
