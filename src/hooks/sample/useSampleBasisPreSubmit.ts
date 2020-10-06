import {
  Event,
  EventType,
  QuestionarySubmissionState,
} from 'models/QuestionarySubmissionModel';
import { SampleSubmissionState } from 'models/SampleSubmissionModel';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

export function useSampleBasisPreSubmit() {
  const { api } = useDataApiWithFeedback();

  return async (
    state: QuestionarySubmissionState,
    dispatch: React.Dispatch<Event>
  ) => {
    const sampleState = state as SampleSubmissionState;
    const title = sampleState.sample.title;

    const result = await api().createSample({
      title: title,
      templateId: state.templateId,
    });

    if (result.createSample.sample) {
      dispatch({
        type: EventType.SAMPLE_LOADED,
        payload: {
          questionarySteps: result.createSample.sample?.questionary.steps,
        },
      });
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
  };
}
