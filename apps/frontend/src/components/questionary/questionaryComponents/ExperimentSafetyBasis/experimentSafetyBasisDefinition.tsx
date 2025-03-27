import { SafetyCheck } from '@mui/icons-material';
import React from 'react';

import { DataType } from 'generated/sdk';

import { createExperimentSafetyBasisValidationSchema } from './createExperimentSafetyBasisValidationSchema';
import { QuestionaryComponentExperimentSafetyBasis } from './QuestionaryComponentExperimentSafetyBasis';
import { QuestionExperimentSafetyBasisForm } from './QuestionExperimentSafetyBasisForm';
import { QuestionTemplateRelationExperimentSafetyBasisForm } from './QuestionTemplateRelationExperimentSafetyBasisForm';
import { QuestionaryComponentDefinition } from '../../QuestionaryComponentRegistry';

export const experimentSafetyBasisDefinition: QuestionaryComponentDefinition = {
  dataType: DataType.EXP_SAFETY_REVIEW_BASIS,
  name: 'Experiment Safety Basis',
  questionaryComponent: QuestionaryComponentExperimentSafetyBasis,
  questionForm: () => QuestionExperimentSafetyBasisForm,
  questionTemplateRelationForm: () =>
    QuestionTemplateRelationExperimentSafetyBasisForm,
  readonly: true,
  creatable: false,
  icon: <SafetyCheck />,
  createYupValidationSchema: createExperimentSafetyBasisValidationSchema,
  getYupInitialValue: ({ state }) => {
    // todo: this needs to be tested
    return 'Experiment Safety Basis YUP Initial Value';
  },
};
