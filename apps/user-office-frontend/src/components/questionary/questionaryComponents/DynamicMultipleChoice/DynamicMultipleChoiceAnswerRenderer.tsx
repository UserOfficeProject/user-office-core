import React from 'react';

import { AnswerRenderer } from 'components/questionary/QuestionaryComponentRegistry';

const DynamicMultipleChoiceAnswerRenderer: AnswerRenderer = ({ value }) => (
  <span>{value.join(', ')}</span>
);

export default DynamicMultipleChoiceAnswerRenderer;
