import React, { useEffect } from "react";
import ProposalContainer from "./ProposalContainer";
import { useGetProposalQuestionary } from "../hooks/useProposalQuestionTemplate" 
import { useCreateProposal } from "../hooks/useCreateProposal";
import { ProposalTemplate } from "../model/ProposalModel";

export default function ProposalSubmission() {
  const { proposal } = useCreateProposal();
  var proposalTemplate:ProposalTemplate | null = null;
  useEffect(() => {
    proposalTemplate = useGetProposalQuestionary(1).proposalTemplate;;
  }, [proposal])
  

  if (!proposal || !proposalTemplate) {
    return <p>Loading</p>;
  }

  return <ProposalContainer data={proposal} template={proposalTemplate} />;
}
