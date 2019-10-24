import React, { useContext } from "react";
import { makeStyles } from "@material-ui/styles";
import ProposalInformationView from "./ProposalInformationView";
import { FormApi } from "./ProposalContainer";
import { useSubmitProposal } from "../hooks/useSubmitProposal";
import { ProposalStatus } from "../models/ProposalModel";
import { ProposalInformation } from "../models/ProposalModel";
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

export default function ProposalReview({
  data
}: {
  data: ProposalInformation;
}) {
  const api = useContext(FormApi);
  const classes = useStyles();
  const { isLoading, submitProposal } = useSubmitProposal();

  return (
    <>
      <ProposalInformationView data={data} disabled={true} />
      <ProposaQuestionaryReview data={data} />
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
          reset={() => api.reset()}
          nextLabel={data.status ? "Update" : "Submit"}
          isLoading={isLoading}
          disabled={true}
        />
      </div>
    </>
  );
}
