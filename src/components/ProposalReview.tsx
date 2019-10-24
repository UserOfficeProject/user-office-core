import React, { useContext } from "react";
import { makeStyles } from "@material-ui/styles";
import ProposalInformationView from "./ProposalInformationView";
import { FormApi } from "./ProposalContainer";
import { useSubmitProposal } from "../hooks/useSubmitProposal";
import { ProposalStatus } from "../models/ProposalModel";
import { ProposalInformation } from "../models/ProposalModel";
import ProposalNavigationFragment from "./ProposalNavigationFragment";
import ProposaQuestionaryReview from "./ProposalQuestionaryReview";
import { useDownloadPDFProposal } from "../hooks/useDownloadPDFProposal";
import { Button } from "@material-ui/core";

const useStyles = makeStyles({
  buttons: {
    display: "flex",
    justifyContent: "flex-end"
  },
  button: {
    marginTop: "30px",
    marginLeft: "10px",
    backgroundColor: "#00C851",
    color: "#ffff" ,
    "&:hover": {
      backgroundColor: "#007E33",
    },
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
  const downloadPDFProposal = useDownloadPDFProposal();

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
          nextLabel={"Submit"}
          isLoading={isLoading}
          disabled={false}
        />
        <Button className={classes.button} onClick={() => downloadPDFProposal(data.id)}>Download PDF</Button>

      </div>
    </>
  );
}
