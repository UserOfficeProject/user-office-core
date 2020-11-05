import { proposalBasisPreSubmit } from 'components/questionary/formComponents/QuestionaryComponentProposalBasis';
import { sampleBasisPreSubmit } from 'components/questionary/formComponents/QuestionaryComponentSampleBasis';
import { sampleDeclarationPostSubmit } from 'components/questionary/formComponents/QuestionaryComponentSampleDeclaration';
import {
  Answer,
  DataType,
  Sdk,
  SubtemplateConfig,
  TemplateCategoryId,
} from 'generated/sdk';
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
) => Promise<any>;

export function usePreSubmitActions() {
  return (answers: Answer[]): SubmitAction[] => {
    const actions = answers.flatMap(answer => {
      switch (answer.question.dataType) {
        case DataType.SAMPLE_BASIS:
          return sampleBasisPreSubmit(answer);
        case DataType.PROPOSAL_BASIS:
          return proposalBasisPreSubmit(answer);
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
        switch (answer.question.dataType) {
          case DataType.SUBTEMPLATE:
            if (
              (answer.config as SubtemplateConfig).templateCategory ===
              TemplateCategoryId.SAMPLE_DECLARATION
            ) {
              return sampleDeclarationPostSubmit(answer);
            }
        }

        return [];
      })
      .filter(promise => promise !== null);

    return actions;
  };
}
