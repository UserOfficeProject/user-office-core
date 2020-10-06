import {
  Answer,
  DataType,
  SubtemplateConfig,
  TemplateCategoryId,
} from 'generated/sdk';
import { QuestionarySubmissionState } from 'models/QuestionarySubmissionModel';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

const isSample = (answer: Answer) => {
  const { dataType, config } = answer.question;

  return (
    dataType === DataType.SUBTEMPLATE &&
    (config as SubtemplateConfig).templateCategory ===
      TemplateCategoryId.SAMPLE_DECLARATION
  );
};

export function useSampleDeclarationPreSubmit() {
  const { api } = useDataApiWithFeedback();

  return async (
    state: QuestionarySubmissionState,
    dispatch: React.Dispatch<Event>
  ) => {
    const sampleAnswers = state.steps[state.stepIndex].fields?.filter(isSample);
    if (!sampleAnswers) {
      return;
    }
    for (const sampleAnswer of sampleAnswers) {
      const sampleIds = sampleAnswer.value;
      if (sampleIds) {
        const { samples } = await api().getSamples({
          filter: { sampleIds: sampleAnswer.value },
        });
        if (samples) {
          await api().createAnswerQuestionaryRelations({
            answerId: sampleAnswer.answerId!,
            questionaryIds: samples.map(sample => sample.questionaryId),
          });
        }
      }
    }
  };
}
