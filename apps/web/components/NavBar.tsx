import { Group, Box } from "@mantine/core";
import { Heading } from "./Heading";
import Link from "next/link";
import { Container } from "./Container";

export const NavBar = () => {
  return (
    <Box
    // sx={(theme) => ({
    //   width: "100%",
    //   padding: 10
    // })}
    >
      <Container>
        <Group position="apart">
          <Link href="/">
            <Heading
              title="uhhhh"
              color="indigo"
              style={{ cursor: "pointer" }}
            />
          </Link>
        </Group>
      </Container>
    </Box>
  );
};
