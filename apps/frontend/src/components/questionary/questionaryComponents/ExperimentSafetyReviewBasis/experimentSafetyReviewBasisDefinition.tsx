import { SafetyCheck } from '@mui/icons-material';
import React from 'react';

import { QuestionaryComponentDefinition } from 'components/questionary/QuestionaryComponentRegistry';
import { DataType } from 'generated/sdk';

import { QuestionaryComponentExperimentSafetyReviewBasis } from './QuestionaryComponentExperimentSafetyReviewBasis';
import { QuestionExperimentSafetyReviewBasisForm } from './QuestionExperimentSafetyReviewBasisForm';
import { QuestionTemplateRelationExperimentSafetyReviewBasisForm } from './QuestionTemplateRelationExperimentSafetyReviewBasisForm';

export const experimentSafetyReviewBasisDefinition: QuestionaryComponentDefinition =
  {
    dataType: DataType.EXPERIMENT_SAFETY_REVIEW_BASIS,
    name: 'Experiment Safety Basis',
    questionaryComponent: QuestionaryComponentExperimentSafetyReviewBasis,
    questionForm: () => QuestionExperimentSafetyReviewBasisForm,
    questionTemplateRelationForm: () =>
      QuestionTemplateRelationExperimentSafetyReviewBasisForm,
    readonly: true,
    creatable: false,
    icon: <SafetyCheck />,
    createYupValidationSchema: null,
    getYupInitialValue: () => {
      return null;
    },
  };
