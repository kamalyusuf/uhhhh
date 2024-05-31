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
  Menu: {
    styles: (theme: MantineTheme) => ({
      itemHovered: {
        backgroundColor: theme.colors.gray[2]
      }
    })
  },
  Title: {
    defaultProps: {
      order: 2,
      c: "white"
    },
    styles: () => ({
      root: {
        fontFamily: "Finlandica, sans-serif"
      }
    })
  },
  Text: {
    defaultProps: {}
  }
};
