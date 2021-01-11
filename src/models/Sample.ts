import { Sample, QuestionaryStep } from 'generated/sdk';

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
  questionary?: { steps: Array<Pick<QuestionaryStep, 'isCompleted'>> };
};
