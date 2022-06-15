import { GetSamplesWithQuestionaryStatusQuery } from 'generated/sdk';

export type SampleCore = NonNullable<
  GetSamplesWithQuestionaryStatusQuery['samples']
>[number];
