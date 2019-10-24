import { makeStyles, Button, CircularProgress } from "@material-ui/core";
import { Fragment } from "react";
import React from "react";

const ProposalNavigationFragment = (props: {
  back: (() => void) | undefined;
  reset: (() => void) | undefined;
  next: (() => void) | undefined;
  isLoading: boolean;
  backLabel?: string;
  nextLabel?: string;
  disabled?: boolean;
}) => {
  if (props.disabled === true) {
    return <div></div>;
  }
  const classes = makeStyles({
    buttons: {
      marginTop: "15px",
      display: "flex",
      justifyContent: "flex-end"
    },
    button: {
      marginTop: "25px",
      marginLeft: "10px"
    }
  })();

  const backbutton = props.back ? (
    <Button
      onClick={() => props.back!()}
      className={classes.buttons}
      type="button"
    >
      {props.backLabel || "Save and back"}
    </Button>
  ) : null;
  const resetButton = props.reset ? (
    <Button
      onClick={() => props.reset!()}
      className={classes.buttons}
      type="button"
    >
      Reset
    </Button>
  ) : null;
  const nextButton = props.next ? (
    <Button
      onClick={() => props.next!()}
      className={classes.buttons}
      type="button"
      variant="contained"
      color="primary"
    >
      {props.nextLabel || "Save and continue"}
    </Button>
  ) : null;
  const buttonArea = props.isLoading ? (
    <CircularProgress />
  ) : (
    <Fragment>
      {backbutton}
      {resetButton}
      {nextButton}
    </Fragment>
  );

  return <div className={classes.buttons}>{buttonArea}</div>;
};

export default ProposalNavigationFragment;
