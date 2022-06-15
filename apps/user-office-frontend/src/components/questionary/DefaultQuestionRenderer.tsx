import React from 'react';

import {
  AnswerRenderer,
  QuestionRenderer,
  Renderers,
} from './QuestionaryComponentRegistry';

const DefaultAnswerRenderer: AnswerRenderer = ({ value }) => (
  <span>{value}</span>
);
const DefaultQuestionRenderer: QuestionRenderer = ({ question }) => (
  <span>{question}</span>
);

const defaultRenderer: Renderers = {
  answerRenderer: DefaultAnswerRenderer,
  questionRenderer: DefaultQuestionRenderer,
};

export default defaultRenderer;
