import { GetVisitQuery } from 'generated/sdk';

import { VisitFragment } from './../generated/sdk';
import { QuestionarySubmissionState } from './QuestionarySubmissionState';

export type VisitBasic = VisitFragment;

export type VisitExtended = Exclude<GetVisitQuery['visit'], null>;
export interface VisitSubmissionState extends QuestionarySubmissionState {
  visit: VisitExtended;
}
