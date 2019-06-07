import React from 'react';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles({
  buttons: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  button: {
    marginTop: "25px",
    marginLeft: "10px",
  },
});


export default function ProposalReview(props) {
  const classes = useStyles();

  return (
    <React.Fragment>
      {console.log(props.data)}
      <div className={classes.buttons}>
        <Button onClick={props.back} className={classes.button}>
          Back
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={props.submit}
          className={classes.button}
        >
          Submit
        </Button>
      </div>
    </React.Fragment>
  );
}