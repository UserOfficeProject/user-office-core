import DynamicFeedIcon from '@mui/icons-material/DynamicFeed';
import React from 'react';

import { DataType } from 'generated/sdk';
import { GenericTemplateSubmissionState } from 'models/questionary/genericTemplate/GenericTemplateSubmissionState';

import { QuestionaryComponentDefinition } from '../../QuestionaryComponentRegistry';
import { createGenericTemplateBasisValidationSchema } from './createGenericTemplateBasisValidationSchema';
import { QuestionaryComponentGenericTemplateBasis } from './QuestionaryComponentGenericTemplateBasis';
import { QuestionGenericTemplateBasisForm } from './QuestionGenericTemplateBasisForm';
import { QuestionTemplateRelationGenericTemplateBasisForm } from './QuestionTemplateRelationGenericTemplateBasisForm';

export const genericTemplateBasisDefinition: QuestionaryComponentDefinition = {
  dataType: DataType.GENERIC_TEMPLATE_BASIS,
  name: 'Sub Template Basis',
  questionaryComponent: QuestionaryComponentGenericTemplateBasis,
  questionForm: () => QuestionGenericTemplateBasisForm,
  questionTemplateRelationForm: () =>
    QuestionTemplateRelationGenericTemplateBasisForm,
  readonly: true,
  creatable: false,
  icon: <DynamicFeedIcon />,
  createYupValidationSchema: createGenericTemplateBasisValidationSchema,
  getYupInitialValue: ({ state }) => {
    const genericTemplateState = state as GenericTemplateSubmissionState;

    return genericTemplateState.genericTemplate.title;
  },
};
