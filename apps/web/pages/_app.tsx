import "../styles/globals.css";
import { GlobalStyles, MantineProvider, NormalizeCSS } from "@mantine/core";
import { AppProps } from "next/app";
import Head from "next/head";
import Router from "next/router";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { Slide, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { styles } from "../mantine/styles";
import { theme } from "../mantine/theme";
import { SocketProvider } from "../modules/socket/SocketProvider";
import { PageComponent } from "../types";
import { useState } from "react";
import { queryClient } from "../lib/query-client";
import { QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";

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

  return (
    <QueryClientProvider client={client}>
      <Head>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>

      <MantineProvider styles={styles} theme={theme}>
        <SocketProvider connect={Component.ws}>
          <NormalizeCSS />
          <GlobalStyles />
          <Component {...pageProps} />
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
        </SocketProvider>
      </MantineProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default MyApp;
