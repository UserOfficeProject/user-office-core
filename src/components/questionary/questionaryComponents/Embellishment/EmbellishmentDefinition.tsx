import TextFieldsIcon from '@material-ui/icons/TextFields';
import React from 'react';

import { DataType } from 'generated/sdk';

import { QuestionaryComponentDefinition } from '../../QuestionaryComponentRegistry';
import { QuestionaryComponentEmbellishment } from './QuestionaryComponentEmbellishment';
import { QuestionEmbellismentForm } from './QuestionEmbellismentForm';
import { QuestionTemplateRelationEmbellismentForm } from './QuestionTemplateRelationEmbellismentForm';

export const embellishmentDefinition: QuestionaryComponentDefinition = {
  dataType: DataType.EMBELLISHMENT,
  name: 'Embellishment',
  questionaryComponent: QuestionaryComponentEmbellishment,
  questionForm: () => QuestionEmbellismentForm,
  questionTemplateRelationForm: () => QuestionTemplateRelationEmbellismentForm,
  readonly: true,
  creatable: true,
  answerRenderer: () => null,
  icon: <TextFieldsIcon />,
  createYupValidationSchema: null,
};
