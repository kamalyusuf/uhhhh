import { createTheme } from "@mantine/core";
import { colors } from "./colors";
import { styles } from "./styles";

export const theme = createTheme({
  fontFamily: "Finlandica, sans-serif",
  primaryColor: "indigo",
  components: styles,
  colors,
  fontSizes: {
    xs: "14",
    sm: "16",
    md: "20",
    lg: "22",
    xl: "26"
  }
});
