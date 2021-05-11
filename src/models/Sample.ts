import {
  GetSampleQuery,
  GetSamplesWithQuestionaryStatusQuery,
  GetSamplesWithProposalDataQuery,
} from 'generated/sdk';

export type SampleWithQuestionaryStatus = Exclude<
  GetSamplesWithQuestionaryStatusQuery['samples'],
  null
>[number];

export type SampleWithQuestionary = Exclude<GetSampleQuery['sample'], null>;

export type SampleWithProposalData = Exclude<
  GetSamplesWithProposalDataQuery['samples'],
  null
>[number];
