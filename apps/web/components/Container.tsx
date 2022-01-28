import React from "react";
import { Container as MantineContainer, ContainerProps } from "@mantine/core";

export const Container = ({ children, ...props }: ContainerProps) => {
  return (
    <MantineContainer size="lg" {...props}>
      {children}
    </MantineContainer>
  );
};
