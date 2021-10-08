import React from 'react';

import {
  Event,
  QuestionarySubmissionState,
} from 'models/questionary/QuestionarySubmissionState';

export interface QuestionaryContextType {
  state: QuestionarySubmissionState | null;
  dispatch: React.Dispatch<Event>;
}
export const QuestionaryContext = React.createContext<QuestionaryContextType>({
  state: null,
  dispatch: () => {},
});

export const createMissingContextErrorMessage = () =>
  `Element is missing valid QuestionaryContext. Wrap this element or one of its parents with QuestionaryContext and make sure it is set up properly`;
