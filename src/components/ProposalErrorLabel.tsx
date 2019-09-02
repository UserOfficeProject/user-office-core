import React from "react";
import { makeStyles } from "@material-ui/core";
export function ProposalErrorLabel(props: any) {
  var classes = makeStyles({
    error: {
      color: "#f44336",
      fontSize: "12px",
      fontWeight: 400
    }
  })();
  return <span className={classes.error}>{props.children}</span>;
}
