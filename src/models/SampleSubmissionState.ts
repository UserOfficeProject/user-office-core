import { Sample } from 'generated/sdk';

import { QuestionarySubmissionState } from './QuestionarySubmissionState';

export interface SampleSubmissionState extends QuestionarySubmissionState {
  sample: Sample;
}
