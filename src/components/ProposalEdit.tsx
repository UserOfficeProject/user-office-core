import React from  'react';
import ProposalContainer from "./ProposalContainer";
import { useProposalData } from "../hooks/useProposalData";
import { useGetProposalQuestionary } from "../hooks/useProposalQuestionTemplate" 

export default function ProposalEdit(props:{match:any}):JSX.Element {

  const { proposalData } = useProposalData(props.match.params.proposalID);
  const { proposalTemplate } = useGetProposalQuestionary(props.match.params.proposalID);

  if (!proposalData || !proposalTemplate) {
    return <p>Loading</p>;
  }

  proposalData!.answers!.forEach(a => {
    proposalTemplate.getFieldById(a.proposal_question_id).value = a.answer;
  });

  return <ProposalContainer data={proposalData!} template={proposalTemplate!}/>;

}
