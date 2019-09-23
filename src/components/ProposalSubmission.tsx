import React, {  } from "react";
import ProposalContainer from "./ProposalContainer";
import { useProposalQuestionTemplate } from "../hooks/useProposalQuestionTemplate" 
import { useCreateProposal } from "../hooks/useCreateProposal";

export default function ProposalSubmission() {
  const { proposalTemplate } = useProposalQuestionTemplate();
  const { proposal } = useCreateProposal();

  if (!proposal || !proposalTemplate) {
    return <p>Loading</p>;
  }

  return <ProposalContainer data={proposal} template={proposalTemplate} />;
}
