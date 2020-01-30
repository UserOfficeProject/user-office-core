import React from "react";

import { Paper, styled, Box } from "@material-ui/core";
import { getTheme } from "../theme";

export const StyledPaper = styled(Paper)({
  marginTop: getTheme().spacing(3),
  marginBottom: getTheme().spacing(3),
  padding: getTheme().spacing(2),
  [getTheme().breakpoints.up(600 + getTheme().spacing(3) * 2)]: {
    marginTop: getTheme().spacing(6),
    marginBottom: getTheme().spacing(6),
    padding: getTheme().spacing(3)
  }
});

export const FormWrapper = styled(({ hMargin, vMargin, ...other }) => (
  <Box {...other} />
))({
  marginTop: props => getTheme().spacing(props.vMargin || 8),
  marginRight: props => getTheme().spacing(props.hMargin || 8),
  marginBottom: props => getTheme().spacing(props.vMargin || 8),
  marginLeft: props => getTheme().spacing(props.hMargin || 8),
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  overflow: "auto"
});
