import { PaperProps } from '@mui/material';
import React, { useState } from 'react';

import UOLoader from 'components/common/UOLoader';
import Questionary from 'components/questionary/Questionary';
import {
  QuestionaryContext,
  QuestionaryContextType,
} from 'components/questionary/QuestionaryContext';
import {
  BasicUserDetails,
  ProposalEndStatus,
  ProposalPublicStatus,
  QuestionaryStep,
  ReviewStatus,
  TemplateGroupId,
} from 'generated/sdk';
import createCustomEventHandlers from 'models/questionary/createCustomEventHandlers';
import { FapReviewSubmissionState } from 'models/questionary/fapReview/FapReviewSubmissionState';
import { FapReviewWithQuestionary } from 'models/questionary/fapReview/FapReviewWithQuestionary';
import {
  Event,
  QuestionarySubmissionModel,
} from 'models/questionary/QuestionarySubmissionState';
import useEventHandlers from 'models/questionary/useEventHandlers';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

export interface ReviewContextType extends QuestionaryContextType {
  state: FapReviewSubmissionState | null;
}

export function createFapReviewStub(
  templateId: number,
  questionarySteps: QuestionaryStep[],
  reviewer: BasicUserDetails
): FapReviewWithQuestionary {
  return {
    id: 0,
    grade: 0,
    comment: '',
    fapID: 0,
    reviewer: reviewer,
    status: ReviewStatus.DRAFT,
    questionary: {
      questionaryId: 0,
      isCompleted: false,
      templateId: templateId,
      created: new Date(),
      steps: questionarySteps,
    },
    questionaryID: 0,
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
      },
      submitted: false,
      users: [],
      samples: [],
      genericTemplates: [],
      commentForManagement: '',
      commentForUser: '',
      commentByScientist: '',
      created: new Date(),
      fapMeetingDecisions: [],
      faps: [],
      finalStatus: ProposalEndStatus.ACCEPTED,
      instruments: [],
      managementDecisionSubmitted: false,
      call: null,
      notified: false,
      proposalBookingsCore: null,
      publicStatus: ProposalPublicStatus.ACCEPTED,
      reviews: [],
      proposerId: 0,
      technicalReviews: [],
      statusId: 0,
      visits: [],
      updated: new Date(),
      submittedDate: new Date(),
      techniques: [],
    },
  };
}

interface ReviewQuestionaryProps {
  review?: FapReviewWithQuestionary;
  reviewUpdated?: (review: FapReviewWithQuestionary) => void;
  elevation?: PaperProps['elevation'];
  previewMode?: boolean;
}
export default function ReviewQuestionary(props: ReviewQuestionaryProps) {
  const { review, reviewUpdated, elevation, previewMode } = props;

  const [initialState] = useState(
    new FapReviewSubmissionState(review!, previewMode)
  );

  const eventHandlers = useEventHandlers(TemplateGroupId.FAP_REVIEW);

  if (!review) {
    return <UOLoader style={{ marginLeft: '50%', marginTop: '100px' }} />;
  }

  const customEventHandlers = createCustomEventHandlers(
    (state: FapReviewSubmissionState, action: Event) => {
      switch (action.type) {
        case 'ITEM_WITH_QUESTIONARY_MODIFIED':
          reviewUpdated?.({
            ...state.fapReview,
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

  return (
    <QuestionaryContext.Provider value={{ state, dispatch }}>
      <StyledContainer>
        <StyledPaper elevation={elevation}>
          <Questionary title="Review" previewMode={previewMode} />
        </StyledPaper>
      </StyledContainer>
    </QuestionaryContext.Provider>
  );
}
