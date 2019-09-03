import { makeStyles, Button, CircularProgress } from "@material-ui/core";
import { Fragment } from "react";
import React from 'react';

const ProposalNavigationFragment = (props:{back:Function|null, showSubmit:boolean, isLoading:boolean}) => 
{
    
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
      
    let backbutton = props.back ? <Button onClick={() => props.back!()} className={classes.buttons}>Back</Button> : null;
    let nextButton = props.showSubmit ? <Button className={classes.buttons} type="submit" variant="contained" color="primary">Next</Button> : null;
    let buttonArea = props.isLoading ? <CircularProgress /> : <Fragment>{backbutton}{nextButton}</Fragment>;

    
    return <div className={classes.buttons}>{buttonArea}</div>;

}

export default ProposalNavigationFragment;