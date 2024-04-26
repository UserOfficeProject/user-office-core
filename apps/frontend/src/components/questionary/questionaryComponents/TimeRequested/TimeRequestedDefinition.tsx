import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { timeRequestedQuestionValidationSchema } from '@user-office-software/duo-validation';
import React from 'react';

import defaultRenderer from 'components/questionary/DefaultQuestionRenderer';
import { DataType } from 'generated/sdk';

import { QuestionaryComponentDefinition } from '../../QuestionaryComponentRegistry';
import { QuestionaryComponentTimeRequested } from './QuestionaryComponentTimeRequested';
import { QuestionTemplateRelationTimeRequestedForm } from './QuestionTemplateRelationTimeRequestedForm';
import { QuestionTimeRequestedForm } from './QuestionTimeRequestedForm';
import TimeRequestedSearchCriteriaComponent from './TimeRequestedSearchCriteriaComponent';

export const timeRequestedDefinition: QuestionaryComponentDefinition = {
  dataType: DataType.TIME_REQUESTED,
  name: 'Time Requested',
  questionaryComponent: QuestionaryComponentTimeRequested,
  questionForm: () => QuestionTimeRequestedForm,
  questionTemplateRelationForm: () => QuestionTemplateRelationTimeRequestedForm,
  readonly: false,
  creatable: true,
  // eslint-disable-next-line react/jsx-no-undef
  icon: <AccessTimeIcon />,
  renderers: defaultRenderer,
  createYupValidationSchema: timeRequestedQuestionValidationSchema,
  searchCriteriaComponent: TimeRequestedSearchCriteriaComponent,
  getYupInitialValue: ({ answer }) => answer.value || '',
};
