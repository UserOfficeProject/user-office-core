import React, { useContext } from "react";
import { makeStyles } from "@material-ui/styles";
import ProposalInformation from "./ProposalInformation";
import ProposalParticipants from "./ProposalParticipants";
import { FormApi } from "./ProposalContainer";
import { useSubmitProposal } from "../hooks/useSubmitProposal";
import { ProposalData, ProposalStatus, ProposalTemplate } from "../model/ProposalModel";
import ProposalNavigationFragment from "./ProposalNavigationFragment";
import ProposaQuestionaryReview from "./ProposalQuestionaryReview";

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

export default function ProposalReview({data, template} : { data: ProposalData, template:ProposalTemplate }) {
  const api = useContext(FormApi);
  const classes = useStyles();
  const { isLoading, submitProposal } = useSubmitProposal();

  return (
    <React.Fragment>
      <ProposalInformation data={data} disabled={true} />
      <ProposaQuestionaryReview data={data} template={template} />
      <ProposalParticipants data={data} disabled={true} />
      <div className={classes.buttons}>

        <ProposalNavigationFragment
        back={() => api.back(data)}
        backLabel="Back"
        next={() => {
          submitProposal(data.id).then(isSubmitted => {
            data.status = ProposalStatus.SUBMITTED;
            api.next(data);
          });
        }}
        nextLabel={data.status ? "Update" : "Submit"}
        isLoading={isLoading}
        disabled={true}
        />
      </div>
    </React.Fragment>
  );
}
