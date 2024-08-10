import type { MantineTheme, MantineThemeComponents } from "@mantine/core";

export const styles: MantineThemeComponents = {
  TextInput: {
    styles: (theme: MantineTheme) => ({
      input: {
        ":focus": {
          borderColor: theme.colors.indigo[6]
        }
      },
      required: {
        color: "red"
      }
    })
  },
  PasswordInput: {
    styles: (theme: MantineTheme) => ({
      input: {
        ":focus": {
          borderColor: theme.colors.indigo[6]
        }
      },
      required: {
        color: theme.colors.red[6]
      }
    })
  },
  Title: {
    defaultProps: {
      order: 2,
      c: "white"
    }
  }
};
