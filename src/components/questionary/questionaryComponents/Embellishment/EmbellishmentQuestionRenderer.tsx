import React from 'react';

import { QuestionRenderer } from 'components/questionary/QuestionaryComponentRegistry';
import { EmbellishmentConfig } from 'generated/sdk';

const EmbellisgmentQuestionRenderer: QuestionRenderer = ({ config }) => (
  <span>{(config as EmbellishmentConfig).plain}</span>
);

export default EmbellisgmentQuestionRenderer;
