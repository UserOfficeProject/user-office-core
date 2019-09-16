import React from  'react';
import ProposalContainer from "./ProposalContainer";
import { useProposalData } from "../hooks/useProposalData";
import { useProposalQuestionTemplate } from "../hooks/useProposalQuestionTemplate" 
import { ProposalData } from '../model/ProposalModel'


export default function ProposalEdit(props:{match:any}):JSX.Element {

  const { proposalData } = useProposalData(props.match.params.proposalID);
  const { proposalTemplate } = useProposalQuestionTemplate();

  if (!proposalData || !proposalTemplate) {
    return <p>Loading</p>;
  }

  proposalData!.answers!.forEach(a => {
    proposalTemplate.getFieldById(a.proposal_question_id).value = a.answer;
  });

  return <ProposalContainer data={proposalData!} template={proposalTemplate!}/>;

}
