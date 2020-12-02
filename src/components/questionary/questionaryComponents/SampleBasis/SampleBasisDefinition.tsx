import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer';
import React from 'react';

import { DataType } from 'generated/sdk';

import { QuestionaryComponentDefinition } from '../../QuestionaryComponentRegistry';
import { createSampleBasisValidationSchema } from './createSampleBasisValidationSchema';
import { QuestionaryComponentSampleBasis } from './QuestionaryComponentSampleBasis';
import { QuestionSampleBasisForm } from './QuestionSampleBasisForm';
import { QuestionTemplateRelationSampleBasisForm } from './QuestionTemplateRelationSampleBasisForm';

export const sampleBasisDefinition: QuestionaryComponentDefinition = {
  dataType: DataType.SAMPLE_BASIS,
  name: 'Sample Basis',
  questionaryComponent: QuestionaryComponentSampleBasis,
  questionForm: () => QuestionSampleBasisForm,
  questionTemplateRelationForm: () => QuestionTemplateRelationSampleBasisForm,
  readonly: true,
  creatable: false,
  icon: <QuestionAnswerIcon />,
  answerRenderer: ({ answer }) => null,
  createYupValidationSchema: createSampleBasisValidationSchema,
};
