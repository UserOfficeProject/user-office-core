import FeedbackIcon from '@mui/icons-material/Feedback';
import React from 'react';

import { DataType } from 'generated/sdk';

import { QuestionaryComponentFeedbackBasis } from './QuestionaryComponentFeedbackBasis';
import { QuestionFeedbackBasisForm } from './QuestionFeedbackBasisForm';
import { QuestionTemplateRelationFeedbackBasisForm } from './QuestionTemplateRelationFeedbackBasisForm';
import { QuestionaryComponentDefinition } from '../../QuestionaryComponentRegistry';

export const feedbackBasisDefinition: QuestionaryComponentDefinition = {
  dataType: DataType.FEEDBACK_BASIS,
  name: 'Feedback Basis',
  questionaryComponent: QuestionaryComponentFeedbackBasis,
  questionForm: () => QuestionFeedbackBasisForm,
  questionTemplateRelationForm: () => QuestionTemplateRelationFeedbackBasisForm,
  readonly: true,
  creatable: false,
  icon: <FeedbackIcon />,
  createYupValidationSchema: null,
  getYupInitialValue: () => null,
};
