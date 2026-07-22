import TodayIcon from '@mui/icons-material/Today';
//import { dateRangeQuestionValidationSchema } from '@user-office-software/duo-validation';
import React from 'react';
import * as Yup from 'yup';

import defaultRenderer from 'components/questionary/DefaultQuestionRenderer';
import { DataType, DateRangeConfig, Answer } from 'generated/sdk';

import DateRangeAnswerRenderer from './DateRangeAnswerRenderer';
import DateSearchCriteriaInput from './DateRangeSearchCriteriaInput';
import { QuestionaryComponentDateRangePicker } from './QuestionaryComponentDateRangePicker';
import { QuestionDateForm } from './QuestionDateRangeForm';
import { QuestionTemplateRelationDateForm } from './QuestionTemplateRelationDateRangeForm';
import { QuestionaryComponentDefinition } from '../../QuestionaryComponentRegistry';

//TODO add validation script to duo-validation
export const dateRangeQuestionValidationSchema = (answer: Answer) => {
  const config = answer.config as DateRangeConfig;
  let dateRangeSchema = Yup.array()
    .of(
      Yup.object({
        from: Yup.date().required(),
        to: Yup.date().required(),
      })
    )
    .required();
  if (config.required) {
    dateRangeSchema = dateRangeSchema.min(1, 'A daterange is required.');
  }

  return Yup.object({ dateRanges: dateRangeSchema });
};

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
