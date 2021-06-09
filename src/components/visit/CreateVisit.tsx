import React, { useContext, useEffect, useState } from 'react';

import UOLoader from 'components/common/UOLoader';
import { UserContext } from 'context/UserContextProvider';
import {
  ProposalEndStatus,
  ProposalPublicStatus,
  QuestionaryStep,
  TemplateCategoryId,
  VisitStatus,
} from 'generated/sdk';
import { VisitBasic, VisitExtended } from 'models/VisitSubmissionState';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

import VisitContainer from './VisitContainer';

function createVisitStub(
  visitorId: number,
  templateId: number,
  questionarySteps: QuestionaryStep[]
): VisitExtended {
  return {
    id: 0,
    status: VisitStatus.DRAFT,
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

interface CreateVisitProps {
  onCreate?: (visit: VisitBasic) => void;
  onUpdate?: (visit: VisitBasic) => void;
}
function CreateVisit({ onCreate, onUpdate }: CreateVisitProps) {
  const { user } = useContext(UserContext);
  const { api } = useDataApiWithFeedback();
  const [blankVisit, setBlankVisit] = useState<VisitExtended>();

  useEffect(() => {
    api()
      .getActiveTemplateId({
        templateCategoryId: TemplateCategoryId.VISIT,
      })
      .then(({ activeTemplateId }) => {
        if (activeTemplateId) {
          api()
            .getBlankQuestionarySteps({ templateId: activeTemplateId })
            .then((result) => {
              if (result.blankQuestionarySteps) {
                const blankVisit = createVisitStub(
                  user.id,
                  activeTemplateId,
                  result.blankQuestionarySteps
                );
                setBlankVisit(blankVisit);
              }
            });
        }
      });
  }, [setBlankVisit, api, user]);

  if (!blankVisit) {
    return <UOLoader />;
  }

  return (
    <VisitContainer
      visit={blankVisit}
      onCreate={onCreate}
      onUpdate={onUpdate}
    />
  );
}

export default CreateVisit;
