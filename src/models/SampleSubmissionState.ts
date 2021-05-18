import { QuestionarySubmissionState } from './QuestionarySubmissionState';
import { SampleWithQuestionary } from './Sample';

export interface SampleSubmissionState extends QuestionarySubmissionState {
  sample: SampleWithQuestionary;
}
