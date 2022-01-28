import React from "react";
import { NavBar } from "./NavBar";
import { Group, GroupProps } from "@mantine/core";

export const Layout = ({
  children,
  spacing = 15,
  ...props
}: React.PropsWithChildren<GroupProps>) => {
  return (
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
  );
};
