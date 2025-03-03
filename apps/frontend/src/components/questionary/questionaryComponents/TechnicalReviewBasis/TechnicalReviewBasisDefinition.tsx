import DescriptionIcon from '@mui/icons-material/Description';
import React from 'react';

import { DataType } from 'generated/sdk';
import { TechnicalReviewSubmissionState } from 'models/questionary/technicalReview/TechnicalReviewSubmissionState';

import { createTechnicalReviewBasisValidationSchema } from './createTechnicalReviewBasisValidationSchema';
import { QuestionaryComponentTechnicalReviewBasis } from './QuestionaryComponentTechnicalReviewBasis';
import { QuestionTechnicalReviewBasisForm } from './QuestionTechnicalReviewBasisForm';
import { QuestionTemplateRelationTechnicalReviewBasisForm } from './QuestionTemplateRelationTechnicalReviewBasisForm';
import { QuestionaryComponentDefinition } from '../../QuestionaryComponentRegistry';

export const technicalReviewBasisDefinition: QuestionaryComponentDefinition = {
  dataType: DataType.EXP_SAFETY_REVIEW_BASIS,
  name: 'Technical Review Basis',
  questionaryComponent: QuestionaryComponentTechnicalReviewBasis,
  questionForm: () => QuestionTechnicalReviewBasisForm,
  questionTemplateRelationForm: () =>
    QuestionTemplateRelationTechnicalReviewBasisForm,
  readonly: true,
  creatable: false,
  icon: <DescriptionIcon />,
  createYupValidationSchema: createTechnicalReviewBasisValidationSchema,
  getYupInitialValue: ({ state }) => {
    const technicalReviewState = state as TechnicalReviewSubmissionState;

    return {
      status: technicalReviewState.technicalReview.status || null,
      timeAllocation: technicalReviewState.technicalReview.timeAllocation || '',
      comment: technicalReviewState.technicalReview.comment || '',
      publicComment: technicalReviewState.technicalReview.publicComment || '',
      files: technicalReviewState.technicalReview.files || [],
    };
  },
};
