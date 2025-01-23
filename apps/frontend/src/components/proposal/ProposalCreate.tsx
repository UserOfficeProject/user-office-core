import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';

import NotFound from 'components/common/NotFound';
import UOLoader from 'components/common/UOLoader';
import { UserContext } from 'context/UserContextProvider';
import { BasicUserDetails, Call, QuestionaryStep } from 'generated/sdk';
import { useCallCloseData } from 'hooks/call/useCallCloseData';
import { useBlankQuestionaryStepsDataByCallId } from 'hooks/questionary/useBlankQuestionaryStepsDataByCallId';
import { useBasicUserData } from 'hooks/user/useUserData';
import { ProposalWithQuestionary } from 'models/questionary/proposal/ProposalWithQuestionary';

import ProposalContainer from './ProposalContainer';

export function createProposalStub(
  templateId: number,
  questionarySteps: QuestionaryStep[],
  proposer: BasicUserDetails,
  callId?: number,
  call?: Call | null
): ProposalWithQuestionary {
  return {
    primaryKey: 0,
    title: '',
    abstract: '',
    callId: callId || 0,
    proposer: proposer,
    questionary: {
      questionaryId: 0,
      isCompleted: false,
      templateId: templateId,
      created: new Date(),
      steps: questionarySteps,
    },
    questionaryId: 0,
    proposalId: '',
    status: {
      id: 0,
      shortCode: 'DRAFT',
      description: '',
      name: '',
      isDefault: true,
      entityType: 'proposal',
    },
    submitted: false,
    users: [],
    samples: [],
    genericTemplates: [],
    call: call,
  };
}

export default function ProposalCreate() {
  const { user } = useContext(UserContext);
  const { callId, templateId } = useParams<{
    callId: string;
    templateId: string;
  }>();
  const { questionarySteps } = useBlankQuestionaryStepsDataByCallId(callId);

  const { call } = useCallCloseData(callId);
  const { userData } = useBasicUserData(user.id);
  if (!questionarySteps || !call || !userData) {
    return <UOLoader style={{ marginLeft: '50%', marginTop: '100px' }} />;
  }

  if (!templateId || !callId) {
    return <NotFound />;
  }

  return (
    <ProposalContainer
      proposal={createProposalStub(
        parseInt(templateId),
        questionarySteps,
        userData,
        parseInt(callId),
        call
      )}
    />
  );
}
