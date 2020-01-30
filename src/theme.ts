import { createMuiTheme } from "@material-ui/core/styles";

export function getTheme() {
  return createMuiTheme({
    palette: {
      primary: {
        dark: "#0081b0",
        main: "#0094ca",
        light: "#00a6e3"
      },
      secondary: {
        dark: "#85a600",
        main: "#99bf00",
        light: "#b8e600"
      },
      error: {
        main: "#f44336"
      }
    }
  });
}
