import React, { useContext } from "react";
import { makeStyles } from "@material-ui/styles";
import { FormApi } from "./ProposalContainer";
import { useSubmitProposal } from "../hooks/useSubmitProposal";
import { ProposalStatus } from "../models/ProposalModel";
import { ProposalInformation } from "../models/ProposalModel";
import ProposalNavigationFragment from "./ProposalNavigationFragment";
import ProposalQuestionaryReview from "./ProposalQuestionaryReview";
import { useDownloadPDFProposal } from "../hooks/useDownloadPDFProposal";
import { Button } from "@material-ui/core";
import withConfirm from "../utils/withConfirm";

const useStyles = makeStyles({
  buttons: {
    display: "flex",
    justifyContent: "flex-end"
  },
  disabled: {
    pointerEvents: "none",
    opacity: 0.7
  },
  button: {
    marginTop: "auto",
    marginLeft: "10px",
    backgroundColor: "#00C851",
    color: "#ffff",
    "&:hover": {
      backgroundColor: "#007E33"
    }
  }
});

function ProposalReview({
  data,
  readonly,
  confirm
}: {
  data: ProposalInformation;
  readonly: boolean;
  confirm: Function;
}) {
  const api = useContext(FormApi);
  const classes = useStyles();
  const { isLoading, submitProposal } = useSubmitProposal();
  const downloadPDFProposal = useDownloadPDFProposal();

  return (
    <>
      <ProposalQuestionaryReview
        data={data}
        className={readonly ? classes.disabled : undefined}
      />
      <div className={classes.buttons}>
        <ProposalNavigationFragment
          back={undefined}
          saveAndNext={{
            callback: () => {
              confirm(
                () => {
                  submitProposal(data.id).then(isSubmitted => {
                    data.status = ProposalStatus.Submitted;
                    api.next(data);
                  });
                },
                {
                  title: "Please confirm",
                  description:
                    "I am aware that no further edits can be done after proposal submission."
                }
              )();
            },
            label:
              data.status === ProposalStatus.Submitted
                ? "✔ Submitted"
                : "Submit",
            disabled: readonly,
            isBusy: isLoading
          }}
          reset={undefined}
          isLoading={false}
          disabled={false}
        />
        <Button
          className={classes.button}
          onClick={() => downloadPDFProposal(data.id)}
          variant="contained"
        >
          Download PDF
        </Button>
      </div>
    </>
  );
}

export default withConfirm(ProposalReview);
