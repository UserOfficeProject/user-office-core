import React from 'react';

import { QuestionRenderer } from 'components/questionary/QuestionaryComponentRegistry';

const EmbellisgmentQuestionRenderer: QuestionRenderer = ({ question }) => (
  <span>{question}</span>
);

export default EmbellisgmentQuestionRenderer;
