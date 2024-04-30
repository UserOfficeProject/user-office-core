import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { intervalQuestionValidationSchema } from '@user-office-software/duo-validation';
import React from 'react';

import defaultRenderer from 'components/questionary/DefaultQuestionRenderer';
import { DataType, IntervalConfig } from 'generated/sdk';

import { QuestionaryComponentDefinition } from '../../QuestionaryComponentRegistry';
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
  createYupValidationSchema: intervalQuestionValidationSchema,
  getYupInitialValue: ({ answer }) =>
    answer.value || {
      min: '',
      max: '',
      unit: (answer.config as IntervalConfig).units?.[0] || null,
    },
  searchCriteriaComponent: IntervalSearchCriteriaComponent,
};
