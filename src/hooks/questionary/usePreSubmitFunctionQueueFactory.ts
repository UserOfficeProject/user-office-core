import { proposalBasisPreSubmit } from 'components/questionary/formComponents/QuestionaryComponentProposalBasis';
import { sampleBasisPreSubmit } from 'components/questionary/formComponents/QuestionaryComponentSampleBasis';
import { sampleDeclarationPreSubmit } from 'components/questionary/formComponents/QuestionaryComponentSampleDeclaration';
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

type PresubmitFunctionQueue = ((
  state: QuestionarySubmissionState,
  dispatch: React.Dispatch<Event>,
  api: Sdk
) => Promise<void>)[];

export function usePreSubmitFunctionQueueFactory() {
  return (answers: Answer[]): PresubmitFunctionQueue => {
    const promises = answers
      .map(answer => {
        switch (answer.question.dataType) {
          case DataType.SAMPLE_BASIS:
            return sampleBasisPreSubmit;
          case DataType.PROPOSAL_BASIS:
            return proposalBasisPreSubmit;
          case DataType.SUBTEMPLATE:
            if (
              (answer.config as SubtemplateConfig).templateCategory ===
              TemplateCategoryId.SAMPLE_DECLARATION
            ) {
              return sampleDeclarationPreSubmit;
            }
        }

        return undefined;
      })
      .filter(promise => promise !== undefined);

    return promises as PresubmitFunctionQueue;
  };
}
