import { Kbd, Group, Text } from "@mantine/core";

interface Props {
  shortcut: string;
  label: string;
}

export const KeyboardShortcut = ({ shortcut, label }: Props) => {
  return (
    <Group gap={20}>
      <Kbd size="md">{shortcut}</Kbd>
      <Text c="dark" fw="bold">
        {label}
      </Text>
    </Group>
  );
};
