import { PaperProps } from '@mui/material';
import React, { useContext, useState } from 'react';

import UOLoader from 'components/common/UOLoader';
import Questionary from 'components/questionary/Questionary';
import {
  QuestionaryContext,
  QuestionaryContextType,
} from 'components/questionary/QuestionaryContext';
import { SettingsContext } from 'context/SettingsContextProvider';
import { UserContext } from 'context/UserContextProvider';
import {
  BasicUserDetails,
  ProposalEndStatus,
  ProposalPublicStatus,
  QuestionaryStep,
  SettingsId,
  TechnicalReview,
  TechnicalReviewStatus,
  TemplateGroupId,
  UserRole,
  WorkflowType,
} from 'generated/sdk';
import { useCheckAccess } from 'hooks/common/useCheckAccess';
import createCustomEventHandlers from 'models/questionary/createCustomEventHandlers';
import {
  Event,
  QuestionarySubmissionModel,
} from 'models/questionary/QuestionarySubmissionState';
import { TechnicalReviewSubmissionState } from 'models/questionary/technicalReview/TechnicalReviewSubmissionState';
import { TechnicalReviewWithQuestionary } from 'models/questionary/technicalReview/TechnicalReviewWithQuestionary';
import useEventHandlers from 'models/questionary/useEventHandlers';

export interface TechnicalReviewContextType extends QuestionaryContextType {
  state: TechnicalReviewSubmissionState | null;
}

export function createTechnicalReviewStub(
  templateId: number,
  questionarySteps: QuestionaryStep[],
  reviewer: BasicUserDetails,
  technicalReviewer: BasicUserDetails
): TechnicalReviewWithQuestionary {
  return {
    id: 0,
    comment: '',
    publicComment: '',
    status: TechnicalReviewStatus.UNFEASIBLE,
    reviewer: reviewer,
    reviewerId: 0,
    files: null,
    submitted: false,
    instrumentId: 0,
    questionary: {
      questionaryId: 0,
      isCompleted: false,
      templateId: templateId,
      created: new Date(),
      steps: questionarySteps,
    },
    questionaryId: 0,
    proposalPk: 0,
    timeAllocation: 0,
    technicalReviewAssignee: technicalReviewer,
    technicalReviewAssigneeId: 0,
    proposal: {
      primaryKey: 0,
      title: '',
      abstract: '',
      callId: 0,
      proposer: reviewer,
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
        entityType: WorkflowType.PROPOSAL,
      },
      submitted: false,
      users: [],
      samples: [],
      genericTemplates: [],
      commentForManagement: '',
      commentForUser: '',
      created: new Date(),
      fapMeetingDecisions: [],
      faps: [],
      finalStatus: ProposalEndStatus.ACCEPTED,
      instruments: [],
      managementDecisionSubmitted: false,
      call: null,
      notified: false,
      publicStatus: ProposalPublicStatus.ACCEPTED,
      reviews: [],
      proposerId: 0,
      technicalReviews: [],
      statusId: 0,
      visits: [],
      updated: new Date(),
      submittedDate: new Date(),
      techniques: [],
      attachments: { questions: [] },
      experiments: null,
    },
  };
}

interface TechnicalReviewQuestionaryProps {
  technicalReview?: TechnicalReviewWithQuestionary;
  technicalReviewUpdated?: (technicalReview: TechnicalReview) => void;
  elevation?: PaperProps['elevation'];
  previewMode?: boolean;
}
export default function TechnicalReviewQuestionary(
  props: TechnicalReviewQuestionaryProps
) {
  const { technicalReview, technicalReviewUpdated, previewMode } = props;

  const { user } = useContext(UserContext);
  const isFapChairOrSec = useCheckAccess([
    UserRole.FAP_CHAIR,
    UserRole.FAP_SECRETARY,
  ]);

  const { settingsMap } = useContext(SettingsContext);

  const fapSecOrChairCanEdit =
    isFapChairOrSec &&
    settingsMap.get(SettingsId.FAP_SECS_EDIT_TECH_REVIEWS)?.settingsValue ===
      'true';

  const [initialState] = useState(
    new TechnicalReviewSubmissionState(
      technicalReview!,
      previewMode,
      user.id,
      '',
      fapSecOrChairCanEdit
    )
  );

  const eventHandlers = useEventHandlers(TemplateGroupId.TECHNICAL_REVIEW);

  const customEventHandlers = createCustomEventHandlers(
    (state: TechnicalReviewSubmissionState, action: Event) => {
      switch (action.type) {
        case 'ITEM_WITH_QUESTIONARY_MODIFIED':
          technicalReviewUpdated?.({
            ...state.technicalReview,
            ...action.itemWithQuestionary,
          });
          break;
      }
    }
  );

  const { state, dispatch } = QuestionarySubmissionModel(initialState, [
    eventHandlers,
    customEventHandlers,
  ]);

  if (!technicalReview) {
    return <UOLoader style={{ marginLeft: '50%', marginTop: '100px' }} />;
  }

  return (
    <>
      <QuestionaryContext.Provider value={{ state, dispatch }}>
        <Questionary title="Technical Review" previewMode={previewMode} />
      </QuestionaryContext.Provider>
    </>
  );
}
