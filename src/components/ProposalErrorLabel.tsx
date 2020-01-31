import React from "react";
import { makeStyles } from "@material-ui/core";
export function ProposalErrorLabel(props: any) {
  var classes = makeStyles(theme => ({
    error: {
      color: theme.palette.error.main,
      fontSize: "12px",
      fontWeight: 400
    }
  }))();
  return <span className={classes.error}>{props.children}</span>;
}
