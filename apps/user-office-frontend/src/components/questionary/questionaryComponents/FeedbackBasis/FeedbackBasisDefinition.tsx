import FeedbackIcon from '@mui/icons-material/Feedback';
import React from 'react';

import { DataType } from 'generated/sdk';

import { QuestionaryComponentDefinition } from '../../QuestionaryComponentRegistry';
import { QuestionaryComponentFeedbackBasis } from './QuestionaryComponentFeedbackBasis';
import { QuestionFeedbackBasisForm } from './QuestionFeedbackBasisForm';
import { QuestionTemplateRelationFeedbackBasisForm } from './QuestionTemplateRelationFeedbackBasisForm';

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
