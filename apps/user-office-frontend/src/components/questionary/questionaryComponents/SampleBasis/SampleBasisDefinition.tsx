import InboxIcon from '@mui/icons-material/Inbox';
import React from 'react';

import { DataType } from 'generated/sdk';
import { SampleSubmissionState } from 'models/questionary/sample/SampleSubmissionState';

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
  icon: <InboxIcon />,
  createYupValidationSchema: createSampleBasisValidationSchema,
  getYupInitialValue: ({ state }) => {
    const sampleState = state as SampleSubmissionState;

    return sampleState.sample.title;
  },
};
