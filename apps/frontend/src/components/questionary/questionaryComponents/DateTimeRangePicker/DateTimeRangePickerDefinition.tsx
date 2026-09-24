import TodayIcon from '@mui/icons-material/Today';
import React from 'react';

import defaultRenderer from 'components/questionary/DefaultQuestionRenderer';
import { DataType } from 'generated/sdk';

import DateTimeRangeAnswerRenderer from './DateTimeRangeAnswerRenderer';
import DateSearchCriteriaInput from './DateTimeRangeSearchCriteriaInput';
import { QuestionaryComponentDateTimeRangePicker } from './QuestionaryComponentDateTimeRangePicker';
import { QuestionDateTimeForm } from './QuestionDateTimeRangeForm';
import { QuestionTemplateRelationDateForm } from './QuestionTemplateRelationDateTimeRangeForm';
import { QuestionaryComponentDefinition } from '../../QuestionaryComponentRegistry';

export const dateTimeRangeDefinition: QuestionaryComponentDefinition = {
  dataType: DataType.DATE_TIME_RANGE,
  name: 'Date Time Range',
  questionaryComponent: QuestionaryComponentDateTimeRangePicker,
  questionForm: () => QuestionDateTimeForm,
  questionTemplateRelationForm: () => QuestionTemplateRelationDateForm,
  readonly: false,
  creatable: true,
  icon: <TodayIcon />,
  renderers: {
    questionRenderer: defaultRenderer.questionRenderer,
    answerRenderer: DateTimeRangeAnswerRenderer,
  },
  createYupValidationSchema: null,
  getYupInitialValue: ({ answer }) => answer.value,
  searchCriteriaComponent: DateSearchCriteriaInput,
};
