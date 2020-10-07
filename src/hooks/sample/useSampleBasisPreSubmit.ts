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
    const sample = (state as SampleSubmissionState).sample;
    const title = sample.title;

    if (sample.id > 0) {
      const result = await api().updateSampleTitle({
        title: title,
        sampleId: sample.id,
      });
      if (result.updateSampleTitle.sample) {
        dispatch({
          type: EventType.SAMPLE_UPDATED,
          payload: {
            sample: result.updateSampleTitle.sample,
          },
        });
      }
    } else {
      const result = await api().createSample({
        title: title,
        templateId: state.templateId,
      });

      if (result.createSample.sample) {
        dispatch({
          type: EventType.SAMPLE_CREATED,
          payload: {
            sample: result.createSample.sample,
          },
        });
      }
    }
  };
}
