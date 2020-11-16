import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import React from 'react';

import { DataType } from 'generated/sdk';

import { QuestionaryComponentDefinition } from '../../QuestionaryComponentRegistry';
import { createBooleanValidationSchema } from './createBooleanValidationSchema';
import { QuestionaryComponentBoolean } from './QuestionaryComponentBoolean';
import { QuestionBooleanForm } from './QuestionBooleanForm';
import { QuestionTemplateRelationBooleanForm } from './QuestionTemplateRelationBooleanForm';

export const booleanDefinition: QuestionaryComponentDefinition = {
  dataType: DataType.BOOLEAN,
  name: 'Boolean',
  questionaryComponent: QuestionaryComponentBoolean,
  questionForm: () => QuestionBooleanForm,
  questionTemplateRelationForm: () => QuestionTemplateRelationBooleanForm,
  readonly: false,
  creatable: true,
  icon: <CheckBoxOutlineBlankIcon />,
  answerRenderer: ({ answer }) => <span>{answer.value}</span>,
  createYupValidationSchema: createBooleanValidationSchema,
};
