import { ThemeIcon, type ThemeIconProps } from "@mantine/core";

export const Icon = ({ children, style, ...props }: ThemeIconProps) => {
  return (
    <ThemeIcon
      variant="light"
      style={{ backgroundColor: "transparent", ...style }}
      {...props}
    >
      {children}
    </ThemeIcon>
  );
};
