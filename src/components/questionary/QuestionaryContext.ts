import React from 'react';

import {
  Event,
  QuestionarySubmissionState,
} from 'models/QuestionarySubmissionState';

export interface QuestionaryContextType {
  state: QuestionarySubmissionState | null;
  dispatch: React.Dispatch<Event>;
}
export const QuestionaryContext = React.createContext<QuestionaryContextType>({
  state: null,
  dispatch: e => {},
});

export const createMissingContextErrorMessage = () =>
  `Element is missing valid QuestionaryContext. Wrap this element or one of its parrents with QuestionaryContext and make sure it is set up properly`;
