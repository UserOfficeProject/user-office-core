import TodayIcon from '@mui/icons-material/Today';
import { dateQuestionValidationSchema } from '@user-office-software/duo-validation';
import { DateTime } from 'luxon';
import React from 'react';

import defaultRenderer from 'components/questionary/DefaultQuestionRenderer';
import { DataType } from 'generated/sdk';

import DateAnswerRenderer from './DateAnswerRenderer';
import DateSearchCriteriaInput from './DateSearchCriteriaInput';
import { preSubmitDateTransform } from './preSubmitDateTransform';
import { QuestionaryComponentDatePicker } from './QuestionaryComponentDatePicker';
import { QuestionDateForm } from './QuestionDateForm';
import { QuestionTemplateRelationDateForm } from './QuestionTemplateRelationDateForm';
import { QuestionaryComponentDefinition } from '../../QuestionaryComponentRegistry';

export const dateDefinition: QuestionaryComponentDefinition = {
  dataType: DataType.DATE,
  name: 'Date',
  questionaryComponent: QuestionaryComponentDatePicker,
  questionForm: () => QuestionDateForm,
  questionTemplateRelationForm: () => QuestionTemplateRelationDateForm,
  readonly: false,
  creatable: true,
  icon: <TodayIcon />,
  renderers: {
    questionRenderer: defaultRenderer.questionRenderer,
    answerRenderer: DateAnswerRenderer,
  },
  createYupValidationSchema: dateQuestionValidationSchema,
  getYupInitialValue: ({ answer }) => {
    const isString = typeof answer.value === 'string';

    return isString ? DateTime.fromISO(answer.value) : answer.value;
  },
  searchCriteriaComponent: DateSearchCriteriaInput,
  preSubmitTransform: preSubmitDateTransform,
};
