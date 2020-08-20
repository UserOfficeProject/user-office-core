import { Sample } from 'generated/sdk';

export type SampleBasic = Pick<
  Sample,
  'id' | 'title' | 'status' | 'questionaryId' | 'created' | 'creatorId'
>;
