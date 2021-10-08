import { Question as SDKQuestion } from 'generated/sdk';

export type Question = Omit<SDKQuestion, '__typename'>;
