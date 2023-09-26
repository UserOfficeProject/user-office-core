import { feedbackBasisPreSubmit } from 'components/questionary/questionaryComponents/FeedbackBasis/QuestionaryComponentFeedbackBasis';
import { genericTemplateBasisPreSubmit } from 'components/questionary/questionaryComponents/GenericTemplateBasis/QuestionaryComponentGenericTemplateBasis';
import { proposalBasisPreSubmit } from 'components/questionary/questionaryComponents/ProposalBasis/QuestionaryComponentProposalBasis';
import { sampleBasisPreSubmit } from 'components/questionary/questionaryComponents/SampleBasis/QuestionaryComponentSampleBasis';
import { shipmentBasisPreSubmit } from 'components/questionary/questionaryComponents/ShipmentBasis/QuestionaryComponentShipmentBasis';
import { visitBasisPreSubmit } from 'components/questionary/questionaryComponents/VisitBasis/QuestionaryComponentVisitBasis';
import { Answer, DataType, Sdk } from 'generated/sdk';
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
  return (answers: Answer[]): SubmitAction[] => {
    const actions = answers.flatMap((answer) => {
      switch (answer.question.dataType) {
        case DataType.SAMPLE_BASIS:
          return sampleBasisPreSubmit();
        case DataType.PROPOSAL_BASIS:
          return proposalBasisPreSubmit();
        case DataType.SHIPMENT_BASIS:
          return shipmentBasisPreSubmit();
        case DataType.VISIT_BASIS:
          return visitBasisPreSubmit();
        case DataType.GENERIC_TEMPLATE_BASIS:
          return genericTemplateBasisPreSubmit();
        case DataType.FEEDBACK_BASIS:
          return feedbackBasisPreSubmit();
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
        switch (
          answer.question.dataType
          // nothing here for now
        ) {
        }

        return [];
      })
      .filter((promise) => promise !== null);

    return actions;
  };
}
