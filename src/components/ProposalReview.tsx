import React, { useContext } from "react";
import { makeStyles } from "@material-ui/core";
import { FormApi } from "./ProposalContainer";
import { useSubmitProposal } from "../hooks/useSubmitProposal";
import ProposalNavigationFragment from "./ProposalNavigationFragment";
import ProposalQuestionaryReview from "./ProposalQuestionaryReview";
import { useDownloadPDFProposal } from "../hooks/useDownloadPDFProposal";
import { Button } from "@material-ui/core";
import withConfirm from "../utils/withConfirm";
import { Proposal, ProposalStatus } from "../generated/sdk";

function ProposalReview({
  data,
  readonly,
  confirm
}: {
  data: Proposal;
  readonly: boolean;
  confirm: Function;
}) {
  const api = useContext(FormApi);
  const { isLoading, submitProposal } = useSubmitProposal();
  const downloadPDFProposal = useDownloadPDFProposal();

  const allStepsComplete =
    data.questionary && data.questionary.steps.every(step => step.isCompleted);

  const classes = makeStyles(theme => ({
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
      backgroundColor: theme.palette.secondary.main,
      color: "#ffff",
      "&:hover": {
        backgroundColor: theme.palette.secondary.light
      }
    }
  }))();

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
                    data.status = ProposalStatus.SUBMITTED;
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
              data.status === ProposalStatus.SUBMITTED
                ? "✔ Submitted"
                : "Submit",
            disabled:
              !allStepsComplete || data.status === ProposalStatus.SUBMITTED,
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
          disabled={!allStepsComplete}
        >
          Download PDF
        </Button>
      </div>
    </>
  );
}

export default withConfirm(ProposalReview);
