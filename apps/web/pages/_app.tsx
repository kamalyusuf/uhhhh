import "nprogress/nprogress.css";
import "react-toastify/dist/ReactToastify.css";
import "@mantine/core/styles.css";
import "../styles/globals.css";
import { MantineProvider } from "@mantine/core";
import Head from "next/head";
import Router from "next/router";
import NProgress from "nprogress";
import { Slide, ToastContainer } from "react-toastify";
import { theme } from "../mantine/theme";
import { SocketProvider } from "../modules/socket/socket-provider";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Authenticated, Unauthenticated } from "../modules/auth/authenticate";
import { SocketHandler } from "../modules/socket/socket-handler";
import { isFirefox } from "react-device-detect";
import { Alert } from "../components/alert";
import { useMounted } from "@mantine/hooks";
import { Analytics } from "@vercel/analytics/next";
import type { AppProps } from "next/app";
import type { PageComponent } from "../types";

Router.events.on("routeChangeStart", NProgress.start);
Router.events.on("routeChangeComplete", NProgress.done);
Router.events.on("routeChangeError", NProgress.done);

const App = ({ Component: C, pageProps }: AppProps) => {
  const Component = C as PageComponent;
  const mounted = useMounted();
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            staleTime: Infinity,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            retryOnMount: false,
            refetchOnMount: false
          },
          mutations: {
            retry: false
          }
        }
      })
  );

  if (!mounted) return null;

  return (
    <QueryClientProvider client={client}>
      <Head>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>

      <MantineProvider theme={theme}>
        {isFirefox ? (
          <Alert
            type="warning"
            message="firefox is not supported. use chrome/edge/brave/opera"
            wrap={false}
            style={{ marginTop: 100 }}
          />
        ) : (
          <SocketProvider>
            <>
              {Component.authenticate === "yes" ? (
                <Authenticated>
                  <Component {...pageProps} />
                </Authenticated>
              ) : Component.authenticate === "not" ? (
                <Unauthenticated>
                  <Component {...pageProps} />
                </Unauthenticated>
              ) : (
                <Component {...pageProps} />
              )}
            </>
            {process.env.NODE_ENV === "production" && (
              <Analytics mode="production" />
            )}
            <ToastContainer
              position="bottom-center"
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
        )}
      </MantineProvider>
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
    </QueryClientProvider>
  );
};

export default App;
