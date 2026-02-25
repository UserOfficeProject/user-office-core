import React, { useContext } from 'react';

import { fapReviewBasisPreSubmit } from 'components/questionary/questionaryComponents/FapReviewBasis/QuestionaryComponentFapReviewBasis';
import { feedbackBasisPreSubmit } from 'components/questionary/questionaryComponents/FeedbackBasis/QuestionaryComponentFeedbackBasis';
import { genericTemplateBasisPreSubmit } from 'components/questionary/questionaryComponents/GenericTemplateBasis/QuestionaryComponentGenericTemplateBasis';
import { proposalBasisPreSubmit } from 'components/questionary/questionaryComponents/ProposalBasis/QuestionaryComponentProposalBasis';
import { sampleBasisPreSubmit } from 'components/questionary/questionaryComponents/SampleBasis/QuestionaryComponentSampleBasis';
import { shipmentBasisPreSubmit } from 'components/questionary/questionaryComponents/ShipmentBasis/QuestionaryComponentShipmentBasis';
import { technicalReviewBasisPreSubmit } from 'components/questionary/questionaryComponents/TechnicalReviewBasis/QuestionaryComponentTechnicalReviewBasis';
import { visitBasisPreSubmit } from 'components/questionary/questionaryComponents/VisitBasis/QuestionaryComponentVisitBasis';
import { FeatureContext } from 'context/FeatureContextProvider';
import { Answer, DataType, FeatureId, Sdk } from 'generated/sdk';
import {
  Event,
  QuestionarySubmissionState,
} from 'models/questionary/QuestionarySubmissionState';

export type SubmitActionDependencyContainer = {
  state: QuestionarySubmissionState;
  dispatch: React.Dispatch<Event>;
  api: Sdk;
};
export type SubmitAction = (
  dependencies: SubmitActionDependencyContainer
) => Promise<number | null>;

export function usePreSubmitActions() {
  const featureContext = useContext(FeatureContext);
  const isInvitesEnabled =
    featureContext.featuresMap.get(FeatureId.EMAIL_INVITE)?.isEnabled ?? false;

  return (answers: Answer[]): SubmitAction[] => {
    const actions = answers.flatMap((answer) => {
      switch (answer.question.dataType) {
        case DataType.SAMPLE_BASIS:
          return sampleBasisPreSubmit();
        case DataType.PROPOSAL_BASIS:
          return proposalBasisPreSubmit(isInvitesEnabled);
        case DataType.SHIPMENT_BASIS:
          return shipmentBasisPreSubmit();
        case DataType.VISIT_BASIS:
          return visitBasisPreSubmit();
        case DataType.GENERIC_TEMPLATE_BASIS:
          return genericTemplateBasisPreSubmit();
        case DataType.FEEDBACK_BASIS:
          return feedbackBasisPreSubmit();
        case DataType.FAP_REVIEW_BASIS:
          return fapReviewBasisPreSubmit();
        case DataType.TECHNICAL_REVIEW_BASIS:
          return technicalReviewBasisPreSubmit();
      }

      return [];
    });

    return actions;
  };
}

export function usePostSubmitActions() {
  return (answers: Answer[]): SubmitAction[] => {
    const actions = answers
      .flatMap((answer) => {
        // nothing here for now remove eslint warning if we ever fill it
        // eslint-disable-next-line no-empty
        switch (answer.question.dataType) {
        }

        return [];
      })
      .filter((promise) => promise !== null);

    return actions;
  };
}
