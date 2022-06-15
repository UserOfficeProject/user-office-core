import { GetSamplesWithProposalDataQuery } from 'generated/sdk';

export type SampleWithProposalData = NonNullable<
  GetSamplesWithProposalDataQuery['samples']
>[number];
