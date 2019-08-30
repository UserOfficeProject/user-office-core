import React, {useContext} from "react";
import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/styles";
import ProposalInformation from "./ProposalInformation";
import ProposalParticipants from "./ProposalParticipants";
import { FormApi } from "./ProposalContainer";

const useStyles = makeStyles({
  buttons: {
    display: "flex",
    justifyContent: "flex-end"
  },
  button: {
    marginTop: "25px",
    marginLeft: "10px"
  }
});

export default function ProposalReview(props) {
  const api = useContext(FormApi);
  const classes = useStyles();

  return (
    <React.Fragment>
      <ProposalInformation data={props.data} disabled={true} />
      <ProposalParticipants data={props.data} disabled={true} />
      <div className={classes.buttons}>
        <Button onClick={api.back} className={classes.button}>
          Back
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={api.next}
          className={classes.button}
        >
          {props.data.status ? "Update" : "Submit"}
        </Button>
      </div>
    </React.Fragment>
  );
}
