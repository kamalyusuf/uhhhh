import { MantineTheme } from "@mantine/core";

// remember: `sx={}` always add the styles to the root element

export const styles = {
  TextInput: (theme: MantineTheme) => ({
    input: {
      "&:focus": {
        borderColor: theme.colors.indigo[6]
      }
    },
    required: {
      color: "red"
    }
  }),
  PasswordInput: (theme: MantineTheme) => ({
    input: {
      "&:focus": {
        borderColor: theme.colors.indigo[6]
      }
    },
    required: {
      color: theme.colors.red[6]
    }
  }),
  Menu: (theme: MantineTheme) => ({
    itemHovered: {
      backgroundColor: theme.colors.gray[2]
    }
  })
  // Container: {
  //   // size: "lg"
  //   wrapper: {
  //     size: "lg"
  //   }
  // }
};
