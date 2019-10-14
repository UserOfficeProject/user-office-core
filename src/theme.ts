import { createMuiTheme } from "@material-ui/core/styles";


export function getTheme() {
  return createMuiTheme({
    palette: {
      primary: {
        dark:"#007daa",
        main: "#0094ca",
        light: "#7de1ff"
      },
      secondary: {
        main: "#9bbe05"
      }
    }
  });
}
