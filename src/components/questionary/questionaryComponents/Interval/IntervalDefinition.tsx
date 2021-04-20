import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import React from 'react';

import defaultRenderer from 'components/questionary/DefaultQuestionRenderer';
import { DataType } from 'generated/sdk';

import { QuestionaryComponentDefinition } from '../../QuestionaryComponentRegistry';
import { createIntervalValidationSchema } from './createIntervalValidationSchema';
import { IntervalAnswerRenderer } from './IntervalAnswerRenderer';
import IntervalSearchCriteriaComponent from './IntervalSearchCriteriaComponent';
import { QuestionaryComponentInterval } from './QuestionaryComponentInterval';
import { QuestionIntervalForm } from './QuestionIntervalForm';
import { QuestionTemplateRelationIntervalForm } from './QuestionTemplateRelationIntervalForm';

export const intervalDefinition: QuestionaryComponentDefinition = {
  dataType: DataType.INTERVAL,
  name: 'Interval',
  questionaryComponent: QuestionaryComponentInterval,
  questionForm: () => QuestionIntervalForm,
  questionTemplateRelationForm: () => QuestionTemplateRelationIntervalForm,
  readonly: false,
  creatable: true,
  icon: <ArrowForwardIosIcon />,
  renderers: {
    answerRenderer: IntervalAnswerRenderer,
    questionRenderer: defaultRenderer.questionRenderer,
  },
  createYupValidationSchema: createIntervalValidationSchema,
  getYupInitialValue: ({ answer }) =>
    answer.value || { min: '', max: '', unit: null },
  searchCriteriaComponent: IntervalSearchCriteriaComponent,
};
