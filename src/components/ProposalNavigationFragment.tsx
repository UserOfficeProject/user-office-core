import { makeStyles, Button, CircularProgress } from "@material-ui/core";
import { Fragment } from "react";
import React from 'react';

const ProposalNavigationFragment = (props:{back:(() => void)|undefined, next:(() => void)|undefined, isLoading:boolean, backLabel?:string, nextLabel?:string, disabled?:boolean}) => 
{
  if(props.disabled === true) 
  {
    return <div></div>
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

      let backbutton = props.back ? <Button onClick={() => props.back!()} className={classes.buttons} type="button">{props.backLabel || "Save and back"}</Button> : null;
      let nextButton = props.next ? <Button onClick={() => props.next!()} className={classes.buttons} type="button" variant="contained" color="primary">{props.nextLabel || "Save and continue"}</Button> : null;
      let buttonArea = props.isLoading ? <CircularProgress /> : <Fragment>{backbutton}{nextButton}</Fragment>;
      
      return <div className={classes.buttons}>{buttonArea}</div>;
}

export default ProposalNavigationFragment;