import {
  Container as MantineContainer,
  type ContainerProps
} from "@mantine/core";

export const Container = ({ children, ...props }: ContainerProps) => {
  return (
    <MantineContainer size="lg" {...props}>
      {children}
    </MantineContainer>
  );
};
