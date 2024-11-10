import { rem, Title, Text, Button, Container, Group } from "@mantine/core";
import type { CSSProperties } from "@mantine/core";

const styles = {
  root: {
    paddingTop: rem(80),
    paddingBottom: rem(120)
  },
  label: {
    textAlign: "center",
    fontWeight: 900,
    fontSize: rem(220),
    lineHeight: 1,
    marginBottom: `calc(var(--mantine-spacing-xl) * 1.5)`,
    color: "var(--mantine-primary-color-3)",
    "@media (max-width: $mantine-breakpoint-sm)": {
      fontSize: rem(120)
    }
  },
  title: {
    fontFamily: "var(--mantine-font-family)",
    textAlign: "center",
    fontWeight: 900,
    fontSize: rem(38),
    color: "var(--mantine-color-gray-6)",
    "@media (max-width: $mantine-breakpoint-sm)": {
      fontSize: rem(32)
    }
  },
  description: {
    maxWidth: rem(540),
    margin: "auto",
    marginTop: "var(--mantine-spacing-xl)",
    marginBottom: "calc(var(--mantine-spacing-xl) * 1.5)",
    color: "var(--mantine-color-gray-4)"
  }
} satisfies Record<string, CSSProperties>;

const ServerError = () => {
  return (
    <div style={styles.root}>
      <Container>
        <div style={styles.label}>500</div>
        <Title style={styles.title}>something bad just happened...</Title>
        <Text c="white" size="lg" ta="center" style={styles.description}>
          our servers could not handle your request. don&apos;t worry, our
          development team was already notified. try refreshing the page
        </Text>
        <Group justify="center">
          <Button size="md" onClick={() => window.location.reload()}>
            refresh the page
          </Button>
        </Group>
      </Container>
    </div>
  );
};

export default ServerError;
