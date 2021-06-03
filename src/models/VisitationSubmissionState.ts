import { GetVisitationQuery } from 'generated/sdk';

import { VisitationFragment } from './../generated/sdk';
import { QuestionarySubmissionState } from './QuestionarySubmissionState';

export type VisitationBasic = VisitationFragment;

export type VisitationExtended = Exclude<
  GetVisitationQuery['visitation'],
  null
>;
export interface VisitationSubmissionState extends QuestionarySubmissionState {
  visitation: VisitationExtended;
}
