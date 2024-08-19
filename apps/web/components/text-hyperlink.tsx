import { Text, type TextProps } from "@mantine/core";
import { Fragment } from "react";

interface Props extends TextProps {
  children: string;
}

const pattern = /(https?:\/\/(?:www\.)?[^\s]+|www\.[^\s]+)/g;

export const TextHyperlink = ({ children, ...props }: Props) => {
  return (
    <Text {...props}>
      {children.split(pattern).map((part, index) => (
        <Fragment key={index}>
          {pattern.test(part) ? (
            <Text
              component="a"
              href={part.startsWith("http") ? part : `https://${part}`}
              c="indigo"
              className="cursor-pointer hover-underline"
              style={{ fontSize: 14 }}
              target="_blank"
              rel="noopener noreferrer"
            >
              {part}
            </Text>
          ) : (
            part
          )}
        </Fragment>
      ))}
    </Text>
  );
};
