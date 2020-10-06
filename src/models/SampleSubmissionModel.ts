import { Sample } from 'generated/sdk';

import { QuestionarySubmissionState } from './QuestionarySubmissionModel';

export interface SampleSubmissionState extends QuestionarySubmissionState {
  sample: Sample;
}
