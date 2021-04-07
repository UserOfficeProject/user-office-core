import React from 'react';

import { Renderers } from './QuestionaryComponentRegistry';

const defaultRenderer: Renderers = {
  answerRenderer: function AnswerRendererComponent({ answer }) {
    return <span>{answer.value}</span>;
  },
  questionRenderer: function QuestionRendererComponent({ question }) {
    return <span>{question.question}</span>;
  },
};

export default defaultRenderer;
