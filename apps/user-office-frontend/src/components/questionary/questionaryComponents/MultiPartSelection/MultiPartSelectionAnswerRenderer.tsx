import React from 'react';

import { MultiPartSelectionConfig } from '../../../../generated/sdk';
import { AnswerRenderer } from '../../QuestionaryComponentRegistry';

const MultipleChoiceAnswerRenderer: AnswerRenderer = ({ config, value }) => {
  const answerConfig = config as MultiPartSelectionConfig;

  return (
    <div>
      <span>{`${answerConfig.partOneQuestion}: ${value.partOneAnswer}`}</span>
      <br />
      <span>{`${answerConfig.partTwoQuestion}: ${value.partTwoAnswer}`}</span>
    </div>
  );
};

export default MultipleChoiceAnswerRenderer;
