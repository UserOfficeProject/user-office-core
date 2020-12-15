import TextFieldsIcon from '@material-ui/icons/TextFields';
import React from 'react';

import { DataType } from 'generated/sdk';

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
  answerRenderer: () => null,
  icon: <TextFieldsIcon />,
  createYupValidationSchema: null,
  getYupInitialValue: () => null,
};
