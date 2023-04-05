import { Kbd, Group, Text } from "@mantine/core";

interface Props {
  shortcut: string;
  label: string;
}

export const KeyboardShortcut = ({ shortcut, label }: Props) => {
  return (
    <Group spacing={20}>
      <Kbd size="md">{shortcut}</Kbd>
      <Text color="dark" weight="bold">
        {label}
      </Text>
    </Group>
  );
};
