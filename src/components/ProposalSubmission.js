import React, {  } from "react";
import ProposalContainer from "./ProposalContainer";
import { useProposalQuestionTemplate } from "../hooks/useProposalQuestionTemplate" 
import { useCreateProposal } from "../hooks/useCreateProposal";
import { ProposalData } from "../model/ProposalModel";

export default function ProposalSubmission() {
  const { proposalTemplate } = useProposalQuestionTemplate();
  const { proposalID } = useCreateProposal();
  

  if (!proposalID || !proposalTemplate) {
    return <p>Loading</p>;
  }

  return <ProposalContainer data={new ProposalData(proposalID)} template={proposalTemplate} />;
}
