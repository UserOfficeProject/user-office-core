import { textInputQuestionValidationSchema } from '@esss-swap/duo-validation';
import ShortTextIcon from '@material-ui/icons/ShortText';
import React from 'react';

import defaultRenderer from 'components/questionary/DefaultQuestionRenderer';
import { QuestionaryComponentDefinition } from 'components/questionary/QuestionaryComponentRegistry';
import { DataType } from 'generated/sdk';

import { QuestionaryComponentTextInput } from './QuestionaryComponentTextInput';
import { QuestionTemplateRelationTextInputForm } from './QuestionTemplateRelationTextInputForm';
import { QuestionTextInputForm } from './QuestionTextInputForm';
import TextSearchCriteriaComponent from './TextSearchCriteriaComponent';

export const textInputDefinition: QuestionaryComponentDefinition = {
  dataType: DataType.TEXT_INPUT,
  name: 'Text Input',
  questionaryComponent: QuestionaryComponentTextInput,
  questionForm: () => QuestionTextInputForm,
  questionTemplateRelationForm: () => QuestionTemplateRelationTextInputForm,
  readonly: false,
  creatable: true,
  icon: <ShortTextIcon />,
  renderers: defaultRenderer,
  createYupValidationSchema: textInputQuestionValidationSchema,
  getYupInitialValue: ({ answer }) => answer.value || '',
  searchCriteriaComponent: TextSearchCriteriaComponent,
};
