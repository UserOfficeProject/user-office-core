import { GetSamplesWithProposalDataQuery } from 'generated/sdk';

export type SampleWithProposalData = Exclude<
  GetSamplesWithProposalDataQuery['samples'],
  null
>[number];
