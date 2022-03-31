import "../styles/globals.css";
import "nprogress/nprogress.css";
import { GlobalStyles, MantineProvider, NormalizeCSS } from "@mantine/core";
import { AppProps } from "next/app";
import Head from "next/head";
import Router from "next/router";
import NProgress from "nprogress";
import splitbee from "@splitbee/web";
import { Slide, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { styles } from "../mantine/styles";
import { theme } from "../mantine/theme";
import { SocketProvider } from "../modules/socket/SocketProvider";
import { PageComponent } from "../types";
import { useState, useEffect } from "react";
import { queryClient } from "../lib/query-client";
import { QueryClientProvider, Hydrate } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { NotAuthenticated } from "../modules/auth/NotAuthenticated";
import { Authenticate } from "../modules/auth/Authenticate";
import { SocketHandler } from "../modules/socket/SocketHandler";
import { useMeStore } from "../store/me";

if (!process.env.NEXT_PUBLIC_API_URL) {
  throw new Error("where API_URL at?");
}

Router.events.on("routeChangeStart", () => {
  NProgress.start();
});
Router.events.on("routeChangeComplete", () => NProgress.done());
Router.events.on("routeChangeError", () => NProgress.done());

const MyApp = ({ Component: C, pageProps }: AppProps) => {
  const Component = C as PageComponent;
  const [client] = useState(() => queryClient());
  const [mounted, setMounted] = useState(false);
  const { me } = useMeStore();

  useEffect(() => {
    setMounted(true);
    splitbee.init();
    splitbee.enableCookie();
  }, []);

  useEffect(() => {
    if (!me) return;

    splitbee.user.set({ ...me });

    return () => {
      splitbee.reset();
    };
  }, [me]);

  if (!mounted) {
    return null;
  }

  return (
    <QueryClientProvider client={client}>
      <Hydrate state={pageProps.dehydrateState}>
        <Head>
          <meta
            name="viewport"
            content="minimum-scale=1, initial-scale=1, width=device-width"
          />
          <script async src="https://cdn.splitbee.io/sb.js"></script>
        </Head>

        <MantineProvider styles={styles} theme={theme}>
          <SocketProvider connect={Component.ws}>
            <NormalizeCSS />
            <GlobalStyles />
            {Component.authenticate === "yes" ? (
              <Authenticate>
                <Component {...pageProps} />
              </Authenticate>
            ) : Component.authenticate === "not" ? (
              <NotAuthenticated>
                <Component {...pageProps} />
              </NotAuthenticated>
            ) : (
              <Component {...pageProps} />
            )}
            <ToastContainer
              position="top-center"
              autoClose={3000}
              newestOnTop={true}
              closeOnClick
              pauseOnHover={true}
              pauseOnFocusLoss={false}
              transition={Slide}
              limit={5}
            />
            <SocketHandler />
          </SocketProvider>
        </MantineProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </Hydrate>
    </QueryClientProvider>
  );
};

export default MyApp;
