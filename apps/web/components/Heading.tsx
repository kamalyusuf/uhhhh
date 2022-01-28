import React from "react";
import { Title, TitleProps } from "@mantine/core";
import { Color } from "../types";
import { parseColor } from "../utils/color";

interface Props extends TitleProps {
  title: string;
  color?: Color;
}

export const Heading = React.forwardRef<any, Props>(
  ({ color, title, ...props }, ref) => {
    return (
      <>
        <Title
          order={2}
          ref={ref}
          sx={(theme) => ({
            color: color ? `${parseColor(theme, color)} !important` : undefined
          })}
          {...props}
        >
          {title}
        </Title>
      </>
    );
  }
);
