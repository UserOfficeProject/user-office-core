import React from 'react';
import { useParams } from 'react-router';

import UOLoader from 'components/common/UOLoader';
import { QuestionaryStep } from 'generated/sdk';
import { useBlankQuestionaryStepsData } from 'hooks/questionary/useBlankQuestionaryStepsData';
import { ProposalSubsetSumbission } from 'models/ProposalModel';

import ProposalContainer from './ProposalContainer';

function createProposalStub(
  callId: number,
  templateId: number,
  questionarySteps: QuestionaryStep[]
): ProposalSubsetSumbission {
  return {
    id: 0,
    title: '',
    abstract: '',
    callId: callId,
    proposer: {
      id: 0,
      created: 0,
      firstname: '',
      lastname: '',
      organisation: '',
      placeholder: false,
      position: '',
    },
    questionary: {
      questionaryId: 0,
      templateId: templateId,
      created: new Date(),
      steps: questionarySteps,
    },
    questionaryId: 0,
    shortCode: '',
    status: { id: 0, description: '', name: '' },
    submitted: false,
    users: [],
  };
}

export default function ProposalCreate() {
  const { callId, templateId } = useParams<any>();
  const { questionarySteps } = useBlankQuestionaryStepsData(
    parseInt(templateId as string)
  );

  if (!questionarySteps) {
    return <UOLoader style={{ marginLeft: '50%', marginTop: '100px' }} />;
  }

  return (
    <ProposalContainer
      proposal={createProposalStub(
        parseInt(callId as string),
        parseInt(templateId as string),
        questionarySteps
      )}
    />
  );
}
