import { NavBar } from "./NavBar";
import { Stack, type StackProps } from "@mantine/core";
import Head from "next/head";

export const Layout = ({
  children,
  spacing = 15,
  title,
  ...props
}: React.PropsWithChildren<StackProps> & { title?: string }) => {
  return (
    <>
      {title && (
        <Head>
          <title>{title}</title>
        </Head>
      )}
      <Stack spacing={spacing} {...props} sx={{ height: "100%" }}>
        <NavBar />
        {children}
      </Stack>
    </>
  );
};
