import React from "react";
import { NavBar } from "./NavBar";
import { Group, GroupProps } from "@mantine/core";
import Head from "next/head";

export const Layout = ({
  children,
  spacing = 15,
  title,
  ...props
}: React.PropsWithChildren<GroupProps> & { title?: string }) => {
  return (
    <>
      {title && (
        <Head>
          <title>{title}</title>
        </Head>
      )}
      <Group
        direction="column"
        grow
        spacing={spacing}
        {...props}
        noWrap
        sx={{ height: "100%" }}
      >
        <NavBar />
        {children}
      </Group>
    </>
  );
};
