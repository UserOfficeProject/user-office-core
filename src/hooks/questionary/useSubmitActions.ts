import { proposalBasisPreSubmit } from 'components/questionary/questionaryComponents/ProposalBasis/QuestionaryComponentProposalBasis';
import { sampleBasisPreSubmit } from 'components/questionary/questionaryComponents/SampleBasis/QuestionaryComponentSampleBasis';
import { shipmentBasisPresubmit } from 'components/questionary/questionaryComponents/ShipmentBasis/QuestionaryComponentShipmentBasis';
import { Answer, DataType, Sdk } from 'generated/sdk';
import {
  Event,
  QuestionarySubmissionState,
} from 'models/QuestionarySubmissionState';

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
    const actions = answers.flatMap(answer => {
      switch (answer.question.dataType) {
        case DataType.SAMPLE_BASIS:
          return sampleBasisPreSubmit(answer);
        case DataType.PROPOSAL_BASIS:
          return proposalBasisPreSubmit(answer);
        case DataType.SHIPMENT_BASIS:
          return shipmentBasisPresubmit(answer);
      }

      return [];
    });

    return actions;
  };
}

export function usePostSubmitActions() {
  return (answers: Answer[]): SubmitAction[] => {
    const actions = answers
      .flatMap(answer => {
        switch (
          answer.question.dataType
          // nothing here for now
        ) {
        }

        return [];
      })
      .filter(promise => promise !== null);

    return actions;
  };
}
