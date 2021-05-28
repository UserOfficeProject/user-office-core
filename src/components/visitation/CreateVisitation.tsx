import React, { useContext, useEffect, useState } from 'react';

import UOLoader from 'components/common/UOLoader';
import { UserContext } from 'context/UserContextProvider';
import {
  ProposalEndStatus,
  ProposalPublicStatus,
  QuestionaryStep,
  TemplateCategoryId,
  VisitationStatus,
} from 'generated/sdk';
import {
  VisitationBasic,
  VisitationExtended,
} from 'models/VisitationSubmissionState';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

import VisitationContainer from './VisitationContainer';

function createVisitationStub(
  visitorId: number,
  templateId: number,
  questionarySteps: QuestionaryStep[]
): VisitationExtended {
  return {
    id: 0,
    status: VisitationStatus.DRAFT,
    questionaryId: 0,
    visitorId: visitorId,
    proposalId: 0,
    questionary: {
      questionaryId: 0,
      templateId: templateId,
      created: new Date(),
      steps: questionarySteps,
    },
    team: [],
    proposal: {
      id: 0,
      title: '',
      abstract: '',
      statusId: 0,
      publicStatus: ProposalPublicStatus.UNKNOWN,
      shortCode: '',
      finalStatus: ProposalEndStatus.UNSET,
      commentForUser: '',
      commentForManagement: '',
      created: null,
      updated: null,
      callId: 0,
      questionaryId: 0,
      notified: false,
      submitted: false,
      managementTimeAllocation: 0,
      managementDecisionSubmitted: false,
      status: null,
      sepMeetingDecision: null,
      technicalReviewAssignee: 0,
      instrument: {
        name: '',
      },
    },
  };
}

interface CreateVisitationProps {
  onCreate?: (visitation: VisitationBasic) => void;
  onUpdate?: (visitation: VisitationBasic) => void;
}
function CreateVisitation({ onCreate, onUpdate }: CreateVisitationProps) {
  const { user } = useContext(UserContext);
  const { api } = useDataApiWithFeedback();
  const [blankVisitation, setBlankVisitation] = useState<VisitationExtended>();

  useEffect(() => {
    api()
      .getActiveTemplateId({
        templateCategoryId: TemplateCategoryId.VISITATION,
      })
      .then(({ activeTemplateId }) => {
        if (activeTemplateId) {
          api()
            .getBlankQuestionarySteps({ templateId: activeTemplateId })
            .then((result) => {
              if (result.blankQuestionarySteps) {
                const blankVisitation = createVisitationStub(
                  user.id,
                  activeTemplateId,
                  result.blankQuestionarySteps
                );
                setBlankVisitation(blankVisitation);
              }
            });
        }
      });
  }, [setBlankVisitation, api, user]);

  if (!blankVisitation) {
    return <UOLoader />;
  }

  return (
    <VisitationContainer
      visitation={blankVisitation}
      onCreate={onCreate}
      onUpdate={onUpdate}
    />
  );
}

export default CreateVisitation;
