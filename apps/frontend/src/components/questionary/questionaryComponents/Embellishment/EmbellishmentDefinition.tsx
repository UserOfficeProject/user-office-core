import TextFieldsIcon from '@mui/icons-material/TextFields';
import React from 'react';

import { DataType } from 'generated/sdk';

import { QuestionaryComponentDefinition } from '../../QuestionaryComponentRegistry';
import EmbellishmentQuestionRenderer from './EmbellishmentQuestionRenderer';
import { QuestionaryComponentEmbellishment } from './QuestionaryComponentEmbellishment';
import { QuestionEmbellishmentForm } from './QuestionEmbellishmentForm';
import { QuestionTemplateRelationEmbellishmentForm } from './QuestionTemplateRelationEmbellishmentForm';

export const embellishmentDefinition: QuestionaryComponentDefinition = {
  dataType: DataType.EMBELLISHMENT,
  name: 'Embellishment',
  questionaryComponent: QuestionaryComponentEmbellishment,
  questionForm: () => QuestionEmbellishmentForm,
  questionTemplateRelationForm: () => QuestionTemplateRelationEmbellishmentForm,
  readonly: true,
  creatable: true,
  renderers: {
    questionRenderer: EmbellishmentQuestionRenderer,
    answerRenderer: () => null,
  },
  icon: <TextFieldsIcon />,
  createYupValidationSchema: null,
  getYupInitialValue: () => null,
};
