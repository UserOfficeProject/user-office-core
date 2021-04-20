import React from 'react';

import { AnswerRenderer } from 'components/questionary/QuestionaryComponentRegistry';

const BooleanAnswerRenderer: AnswerRenderer = ({ value }) => {
  return <span>{value ? 'Yes' : 'No'}</span>;
};

export default BooleanAnswerRenderer;
