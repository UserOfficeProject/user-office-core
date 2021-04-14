import { Questionary, Sample } from 'generated/sdk';

export type SampleBasic = Pick<
  Sample,
  | 'id'
  | 'title'
  | 'safetyStatus'
  | 'safetyComment'
  | 'questionaryId'
  | 'created'
  | 'creatorId'
> & {
  questionary?: Pick<Questionary, 'isCompleted'>;
};
