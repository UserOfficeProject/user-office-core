import { ProposalSubsetSumbission } from 'models/ProposalModel';

import { QuestionarySubmissionState } from './QuestionarySubmissionState';

export interface ProposalSubmissionState extends QuestionarySubmissionState {
  proposal: ProposalSubsetSumbission;
}
