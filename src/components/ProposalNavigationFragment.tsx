import { makeStyles, Button, CircularProgress } from "@material-ui/core";
import { Fragment } from "react";
import React from "react";

const ProposalNavigationFragment = (props: {
  back?: IButtonConfig;
  reset?: IButtonConfig;
  save?: IButtonConfig;
  saveAndNext?: IButtonConfig;
  isLoading: boolean;
  disabled?: boolean;
}) => {
  if (props.disabled === true) {
    return <div></div>;
  }
  const classes = makeStyles({
    buttons: {
      marginTop: "15px",
      display: "flex",
      justifyContent: "flex-end",
      
    },
    button: {
      margin: "25px 10px 0 10px",
      '&:first-child': {
        marginLeft: '0',
      },
      '&:last-child': {
        marginRight: '0',
      }
    },
     lastLeftButton: {
      marginRight:"auto"
    }
  })();

  const backbutton = props.back ? (
    <Button
      onClick={() => props.back!.callback()}
      className={`${classes.button} ${classes.lastLeftButton}`}
      type="button"
      disabled={props.back.disabled}
    >
      {props.back.label || "Back"}
    </Button>
  ) : null;
  const resetButton = props.reset ? (
    <Button
      onClick={() => props.reset!.callback()}
      className={classes.button}
      type="button"
      disabled={props.reset.disabled}
    >
      {props.reset.label || "Reset"}
    </Button>
  ) : null;
  const saveButton = props.save ? (
    <Button
      onClick={() => props.save!.callback()}
      className={classes.button}
      type="button"
      variant="contained"
      color="primary"
      disabled={props.save.disabled}
    >
      {props.save.label || "Save"}
    </Button>
    ) : null;
  const saveAndNextButton = props.saveAndNext ? (
    <Button
      onClick={() => props.saveAndNext!.callback()}
      className={classes.button}
      type="button"
      variant="contained"
      color="primary"
      disabled={props.saveAndNext.disabled}
    >
      {props.saveAndNext.label || "Save and continue"}
    </Button>
  ) : null;
  const buttonArea = props.isLoading ? (
    <CircularProgress />
  ) : (
    <Fragment>
      {backbutton}
      {resetButton}
      {saveButton}
      {saveAndNextButton}
    </Fragment>
  );

  return <div className={classes.buttons}>{buttonArea}</div>;
};

export default ProposalNavigationFragment;

interface IButtonConfig {
  callback:() => void,
  label?:string,
  disabled?:boolean
}
