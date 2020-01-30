import { createMuiTheme } from "@material-ui/core/styles";

export function getTheme() {
  return createMuiTheme({
    palette: {
      primary: {
        dark: "#007daa",
        main: "#0094ca",
        light: "#7de1ff"
      },
      secondary: {
        main: "#72be00",
        light: "#8bd916"
      },
      error: {
        main: "#f44336"
      }
    }
  });
}
