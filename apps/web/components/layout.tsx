import { NavBar } from "./navbar";
import { Stack, type StackProps } from "@mantine/core";
import Head from "next/head";
import type { PropsWithChildren } from "react";

interface Props extends StackProps {
  title?: string;
}

export const Layout = ({
  children,
  gap = 15,
  title,
  ...props
}: PropsWithChildren<Props>) => {
  return (
    <>
      {title ? (
        <Head>
          <title>{title}</title>
        </Head>
      ) : null}

      <Stack gap={gap} {...props} style={{ height: "100%" }}>
        <NavBar />
        {children}
      </Stack>
    </>
  );
};
