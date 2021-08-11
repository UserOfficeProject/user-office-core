import { GetSamplesWithQuestionaryStatusQuery } from 'generated/sdk';

export type SampleCore = Exclude<
  GetSamplesWithQuestionaryStatusQuery['samples'],
  null
>[number];
