import React, { useContext } from 'react';
import { useParams } from 'react-router';

import UOLoader from 'components/common/UOLoader';
import { UserContext } from 'context/UserContextProvider';
import { BasicUserDetails, QuestionaryStep } from 'generated/sdk';
import { useBlankQuestionaryStepsData } from 'hooks/questionary/useBlankQuestionaryStepsData';
import { ProposalSubsetSubmission } from 'models/ProposalSubmissionState';

import ProposalContainer from './ProposalContainer';

function createProposalStub(
  callId: number,
  templateId: number,
  questionarySteps: QuestionaryStep[],
  proposer: BasicUserDetails
): ProposalSubsetSubmission {
  return {
    id: 0,
    title: '',
    abstract: '',
    callId: callId,
    proposer: proposer,
    questionary: {
      questionaryId: 0,
      isCompleted: false,
      templateId: templateId,
      created: new Date(),
      steps: questionarySteps,
    },
    questionaryId: 0,
    shortCode: '',
    status: {
      id: 0,
      shortCode: '',
      description: '',
      name: '',
      isDefault: true,
    },
    submitted: false,
    users: [],
    samples: [],
  };
}

export default function ProposalCreate() {
  const { user } = useContext(UserContext);
  const { callId, templateId } = useParams<{
    callId: string;
    templateId: string;
  }>();
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
        questionarySteps,
        user
      )}
    />
  );
}
