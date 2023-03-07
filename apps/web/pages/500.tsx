import {
  createStyles,
  Title,
  Text,
  Button,
  Container,
  Group
} from "@mantine/core";

const useStyles = createStyles((theme) => ({
  root: {
    paddingTop: 80,
    paddingBottom: 120
  },

  label: {
    textAlign: "center",
    fontWeight: 900,
    fontSize: 220,
    lineHeight: 1,
    marginBottom: `calc(${theme.spacing.lg} * 1.5)`,
    color: theme.colors[theme.primaryColor][3],

    [theme.fn.smallerThan("sm")]: {
      fontSize: 120
    }
  },

  title: {
    textAlign: "center",
    fontWeight: 900,
    fontSize: 38,
    color: theme.white,

    [theme.fn.smallerThan("sm")]: {
      fontSize: 32
    }
  },

  description: {
    maxWidth: 540,
    margin: "auto",
    marginTop: theme.spacing.xl,
    marginBottom: `calc(${theme.spacing.lg} * 1.5)`,
    color: theme.colors[theme.primaryColor][1]
  }
}));

const ServerError = () => {
  const { classes } = useStyles();

  return (
    <div className={classes.root}>
      <Container>
        <div className={classes.label}>500</div>
        <Title className={classes.title}>something bad just happened...</Title>
        <Text size="lg" align="center" className={classes.description}>
          our servers could not handle your request. don&apos;t worry, our
          development team was already notified. try refreshing the page.
        </Text>
        <Group position="center">
          <Button size="md" onClick={() => window.location.reload()}>
            refresh the page
          </Button>
        </Group>
      </Container>
    </div>
  );
};

export default ServerError;
