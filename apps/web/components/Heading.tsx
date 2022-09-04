import { Title, type TitleProps } from "@mantine/core";
import { forwardRef } from "react";
import type { Color } from "../types";
import { parse } from "../utils/color";

interface Props extends TitleProps {
  title: string;
  color?: Color;
}

export const Heading = forwardRef<any, Props>(
  ({ color, title, ...props }, ref) => {
    return (
      <>
        <Title
          order={2}
          ref={ref}
          sx={(theme) => ({
            color: color ? `${parse(theme, color)} !important` : undefined
          })}
          {...props}
        >
          {title}
        </Title>
      </>
    );
  }
);
