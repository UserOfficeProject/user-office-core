import TodayIcon from '@mui/icons-material/Today';
import { dateRangeQuestionValidationSchema } from '@user-office-software/duo-validation';
import React from 'react';

import defaultRenderer from 'components/questionary/DefaultQuestionRenderer';
import { DataType } from 'generated/sdk';

import DateRangeAnswerRenderer from './DateRangeAnswerRenderer';
import DateSearchCriteriaInput from './DateRangeSearchCriteriaInput';
import { QuestionaryComponentDateRangePicker } from './QuestionaryComponentDateRangePicker';
import { QuestionDateForm } from './QuestionDateRangeForm';
import { QuestionTemplateRelationDateForm } from './QuestionTemplateRelationDateRangeForm';
import { QuestionaryComponentDefinition } from '../../QuestionaryComponentRegistry';

export const dateRangeDefinition: QuestionaryComponentDefinition = {
  dataType: DataType.DATE_RANGE_PICKER,
  name: 'Date Range',
  questionaryComponent: QuestionaryComponentDateRangePicker,
  questionForm: () => QuestionDateForm,
  questionTemplateRelationForm: () => QuestionTemplateRelationDateForm,
  readonly: false,
  creatable: true,
  icon: <TodayIcon />,
  renderers: {
    questionRenderer: defaultRenderer.questionRenderer,
    answerRenderer: DateRangeAnswerRenderer,
  },
  createYupValidationSchema: dateRangeQuestionValidationSchema,
  getYupInitialValue: ({ answer }) => answer.value,
  searchCriteriaComponent: DateSearchCriteriaInput,
};
