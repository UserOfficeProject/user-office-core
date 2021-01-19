import React from 'react';

import { Renderers } from './QuestionaryComponentRegistry';

const defaultRenderer: Renderers = {
  answerRenderer: ({ answer }) => <span>{answer.value}</span>,
  questionRenderer: ({ question }) => <span>{question.question}</span>,
};

export default defaultRenderer;
