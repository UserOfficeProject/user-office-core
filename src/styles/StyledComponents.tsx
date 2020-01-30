import React from "react";

import { Paper, styled, Box } from "@material-ui/core";
import { getTheme } from "../theme";
import { isArray } from "util";

export const StyledPaper = styled(({ ...other }) => <Paper {...other} />)({
  margin: props => getSpacing(props.margin, [3, 0]),
  padding: props => getSpacing(props.margin, [2]),
  [getTheme().breakpoints.up(600 + getTheme().spacing(3) * 2)]: {
    margin: props => getSpacing(props.margin, [6, 0]),
    padding: props => getSpacing(props.padding, [3])
  }
});

export const FormWrapper = styled(({ ...other }) => <Box {...other} />)({
  margin: props => getSpacing(props.margin, [8]),
  display: props => props.display || "flex",
  flexDirection: props => props.flexDirection || "column",
  alignItems: props => props.alignItems || "center",
  overflow: props => props.overflow || "auto"
});

const getSpacing = (userValue: any, defaultValue: any) => {
  return getTheme().spacing.apply(getTheme(), userValue || defaultValue);
};
