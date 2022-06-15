import React from 'react';

import { AnswerRenderer } from 'components/questionary/QuestionaryComponentRegistry';

const MultipleChoiceAnswerRenderer: AnswerRenderer = ({ value }) => (
  <span>{value.join(', ')}</span>
);

export default MultipleChoiceAnswerRenderer;
