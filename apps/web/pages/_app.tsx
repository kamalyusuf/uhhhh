import "@mantine/core/styles.css";
import "react-toastify/dist/ReactToastify.css";
import "../styles/globals.scss";
import "nprogress/nprogress.css";
import { MantineProvider } from "@mantine/core";
import type { AppProps } from "next/app";
import Head from "next/head";
import Router from "next/router";
import NProgress from "nprogress";
import { Slide, ToastContainer } from "react-toastify";
import { theme } from "../mantine/theme";
import { SocketProvider } from "../modules/socket/socket-provider";
import type { PageComponent } from "../types";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Authenticate } from "../modules/auth/_authenticate";
import { SocketHandler } from "../modules/socket/socket-handler";
import { useMounted } from "../hooks/use-mounted";
import { isFirefox } from "react-device-detect";
import { Alert } from "../components/_alert";
import { api } from "../lib/api";

if (!process.env.NEXT_PUBLIC_API_URL) throw new Error("where API_URL at?");

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
            queryFn: async ({ queryKey }) =>
              (await api.get(`${queryKey[0]}`)).data,
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
                <Authenticate.Yes>
                  <Component {...pageProps} />
                </Authenticate.Yes>
              ) : Component.authenticate === "not" ? (
                <Authenticate.Not>
                  <Component {...pageProps} />
                </Authenticate.Not>
              ) : (
                <Component {...pageProps} />
              )}
            </>
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
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default App;
