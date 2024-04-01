import { Title, Text, Button, Container, Group } from "@mantine/core";
import classes from "../styles/500.module.css";

const ServerError = () => {
  return (
    <div className={classes.root}>
      <Container>
        <div className={classes.label}>500</div>
        <Title className={classes.title}>something bad just happened...</Title>
        <Text size="lg" ta="center" className={classes.description}>
          our servers could not handle your request. don&apos;t worry, our
          development team was already notified. try refreshing the page.
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
