import { Badge } from "@mantine/core";

interface Props {
  name: string;
}

export const UserBadge = ({ name }: Props) => {
  return (
    <Badge
      variant="dot"
      size="md"
      styles={{
        inner: {
          color: "white"
        }
      }}
    >
      {name}
    </Badge>
  );
};
