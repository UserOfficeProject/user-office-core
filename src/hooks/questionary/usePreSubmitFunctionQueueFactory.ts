import {
  Answer,
  DataType,
  SubtemplateConfig,
  TemplateCategoryId,
} from 'generated/sdk';
import { useSampleBasisPreSubmit } from 'hooks/sample/useSampleBasisPreSubmit';
import { useSampleDeclarationPreSubmit } from 'hooks/sample/useSampleDeclarationPreSubmit';
import {
  Event,
  QuestionarySubmissionState,
} from 'models/QuestionarySubmissionModel';

type PresubmitFunctionQueue = ((
  state: QuestionarySubmissionState,
  dispatch: React.Dispatch<Event>
) => Promise<void>)[];

export function usePreSubmitFunctionQueue() {
  const sampleBasisPreSubmit = useSampleBasisPreSubmit();
  const sampleDeclarationPresubmit = useSampleDeclarationPreSubmit();

  return (answers: Answer[]): PresubmitFunctionQueue => {
    const promises = answers
      .map(answer => {
        switch (answer.question.dataType) {
          case DataType.SAMPLE_BASIS:
            return sampleBasisPreSubmit;
          case DataType.SUBTEMPLATE:
            if (
              (answer.config as SubtemplateConfig).templateCategory ===
              TemplateCategoryId.SAMPLE_DECLARATION
            ) {
              return sampleDeclarationPresubmit;
            }
        }

        return undefined;
      })
      .filter(promise => promise !== undefined);

    return promises as PresubmitFunctionQueue;
  };
}
