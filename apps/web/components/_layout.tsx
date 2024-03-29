import { NavBar } from "./_navbar";
import { Stack, type StackProps } from "@mantine/core";
import Head from "next/head";
import type { PropsWithChildren } from "react";

interface Props extends StackProps {
  title?: string;
}

export const Layout = ({
  children,
  spacing = 15,
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

      <Stack spacing={spacing} {...props} sx={{ height: "100%" }}>
        <NavBar />
        {children}
      </Stack>
    </>
  );
};
