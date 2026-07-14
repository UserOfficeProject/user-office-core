import TodayIcon from '@mui/icons-material/Today';
//import { dateRangeQuestionValidationSchema } from '@user-office-software/duo-validation';
import { DateTime } from 'luxon';
import React from 'react';

import defaultRenderer from 'components/questionary/DefaultQuestionRenderer';
import { DataType } from 'generated/sdk';

import DateRangeAnswerRenderer from './DateRangeAnswerRenderer';
import DateSearchCriteriaInput from './DateRangeSearchCriteriaInput';
import { preSubmitDateTransform } from './preSubmitDateRangeTransform';
import { QuestionaryComponentDateRangePicker } from './QuestionaryComponentDateRangePicker';
import { QuestionDateForm } from './QuestionDateRangeForm';
import { QuestionTemplateRelationDateForm } from './QuestionTemplateRelationDateRangeForm';
import { QuestionaryComponentDefinition } from '../../QuestionaryComponentRegistry';

export function normalizeDate(date: string, includeTime: boolean) {
  let normalizedDate = DateTime.fromISO(date);

  if (includeTime) {
    normalizedDate = normalizedDate.startOf('minute');
  } else {
    normalizedDate = normalizedDate.startOf('day');
  }

  return normalizedDate.toJSDate();
}

// const dateRangeQuestionValidationSchema = (field: any) => {
//   console.log('running validation now on: ');
//   const schema = Yup.array().of(
//     Yup.object({
//       from: Yup.date()
//         .required()
//         .transform(function (value: Date) {
//           return value && this.isType(value)
//             ? normalizeDate(value.toISOString(), false)
//             : value;
//         })
//         .typeError('Invalid date'),
//       to: Yup.date()
//         .required()
//         .transform(function (value: Date) {
//           return value && this.isType(value)
//             ? normalizeDate(value.toISOString(), false)
//             : value;
//         })
//         .typeError('Invalid date'),
//     })
//   );

//   return schema;
// };

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
  createYupValidationSchema: null,
  getYupInitialValue: ({ answer }) => answer.value,
  searchCriteriaComponent: DateSearchCriteriaInput,
  preSubmitTransform: preSubmitDateTransform,
};
