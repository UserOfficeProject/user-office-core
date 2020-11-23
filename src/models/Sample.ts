import { Sample } from 'generated/sdk';

export type SampleBasic = Pick<
  Sample,
  | 'id'
  | 'title'
  | 'safetyStatus'
  | 'safetyComment'
  | 'questionaryId'
  | 'created'
  | 'creatorId'
>;
