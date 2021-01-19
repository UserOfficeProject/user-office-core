import TextFieldsIcon from '@material-ui/icons/TextFields';
import React from 'react';

import { DataType, EmbellishmentConfig } from 'generated/sdk';

import { QuestionaryComponentDefinition } from '../../QuestionaryComponentRegistry';
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
    questionRenderer: ({ question }) => (
      <span>{(question.config as EmbellishmentConfig).plain}</span>
    ),
    answerRenderer: () => null,
  },
  icon: <TextFieldsIcon />,
  createYupValidationSchema: null,
  getYupInitialValue: () => null,
};
