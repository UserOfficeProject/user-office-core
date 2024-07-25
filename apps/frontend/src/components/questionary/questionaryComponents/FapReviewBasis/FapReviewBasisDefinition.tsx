import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import React from 'react';

import { DataType } from 'generated/sdk';
import { FapReviewSubmissionState } from 'models/questionary/fapReview/FapReviewSubmissionState';

import { createFapReviewBasisValidationSchema } from './createFapReviewBasisValidationSchema';
import { QuestionaryComponentFapReviewBasis } from './QuestionaryComponentFapReviewBasis';
import { QuestionFapReviewBasisForm } from './QuestionFapReviewBasisForm';
import { QuestionTemplateRelationFapReviewBasisForm } from './QuestionTemplateRelationFapReviewBasisForm';
import { QuestionaryComponentDefinition } from '../../QuestionaryComponentRegistry';

export const fapReviewBasisDefinition: QuestionaryComponentDefinition = {
  dataType: DataType.FAP_REVIEW_BASIS,
  name: 'Fap Review Basis',
  questionaryComponent: QuestionaryComponentFapReviewBasis,
  questionForm: () => QuestionFapReviewBasisForm,
  questionTemplateRelationForm: () =>
    QuestionTemplateRelationFapReviewBasisForm,
  readonly: true,
  creatable: false,
  icon: <FlightTakeoffIcon />,
  createYupValidationSchema: createFapReviewBasisValidationSchema,
  getYupInitialValue: ({ state }) => {
    const fapReviewState = state as FapReviewSubmissionState;

    return fapReviewState.fapReview;
  },
};
