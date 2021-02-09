import TextFormatIcon from '@material-ui/icons/TextFormat';
import React from 'react';

import { QuestionaryComponentDefinition } from 'components/questionary/QuestionaryComponentRegistry';
import { DataType } from 'generated/sdk';

import { createRichTextInputValidationSchema } from './createRichTextInputValidationSchema';
import { QuestionaryComponentRichTextInput } from './QuestionaryComponentRichTextInput';
import { QuestionRichTextInputForm } from './QuestionRichTextInputForm';
import { QuestionTemplateRelationRichTextInputForm } from './QuestionTemplateRelationRichTextInputForm';
import richTextInputRenderer from './RichTextInputRenderer';

export const richTextInputDefinition: QuestionaryComponentDefinition = {
  dataType: DataType.RICH_TEXT_INPUT,
  name: 'Rich Text Input',
  questionaryComponent: QuestionaryComponentRichTextInput,
  questionForm: () => QuestionRichTextInputForm,
  questionTemplateRelationForm: () => QuestionTemplateRelationRichTextInputForm,
  readonly: false,
  creatable: true,
  icon: <TextFormatIcon />,
  renderers: richTextInputRenderer,
  createYupValidationSchema: createRichTextInputValidationSchema,
  getYupInitialValue: ({ answer }) => answer.value || '',
};
