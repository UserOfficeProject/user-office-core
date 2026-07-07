import TodayIcon from '@mui/icons-material/Today';
import { dateQuestionValidationSchema } from '@user-office-software/duo-validation';
import React from 'react';

import defaultRenderer from 'components/questionary/DefaultQuestionRenderer';
import { DataType } from 'generated/sdk';

import DateAnswerRenderer from './DateRangeAnswerRenderer';
import DateSearchCriteriaInput from './DateRangeSearchCriteriaInput';
import { preSubmitDateTransform } from './preSubmitDateRangeTransform';
import { QuestionaryComponentDatePicker } from './QuestionaryComponentDateRangePicker';
import { QuestionDateForm } from './QuestionDateRangeForm';
import { QuestionTemplateRelationDateForm } from './QuestionTemplateRelationDateRangeForm';
import { QuestionaryComponentDefinition } from '../../QuestionaryComponentRegistry';

export const dateRangeDefinition: QuestionaryComponentDefinition = {
  dataType: DataType.DATE,
  name: 'Date Range',
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
  getYupInitialValue: ({ answer }) => answer.value,
  searchCriteriaComponent: DateSearchCriteriaInput,
  preSubmitTransform: preSubmitDateTransform,
};
