import RadioButtonCheckedIcon from '@material-ui/icons/RadioButtonChecked';
import React from 'react';

import defaultRenderer from 'components/questionary/DefaultQuestionRenderer';
import MultipleChoiceSearchCriteriaComponent from 'components/questionary/questionaryComponents/MultipleChoice/MultipleChoiceSearchCriteriaComponent';
import { DataType } from 'generated/sdk';

import { QuestionaryComponentDefinition } from '../../QuestionaryComponentRegistry';
import { createMultipleChoiceValidationSchema } from './createMultipleChoiceValidationSchema';
import { QuestionaryComponentMultipleChoice } from './QuestionaryComponentMultipleChoice';
import { QuestionMultipleChoiceForm } from './QuestionMultipleChoiceForm';
import { QuestionTemplateRelationMultipleChoiceForm } from './QuestionTemplateRelationMultipleChoiceForm';

export const multipleChoiceDefinition: QuestionaryComponentDefinition = {
  dataType: DataType.SELECTION_FROM_OPTIONS,
  name: 'Multiple choice',
  questionaryComponent: QuestionaryComponentMultipleChoice,
  questionForm: () => QuestionMultipleChoiceForm,
  questionTemplateRelationForm: () =>
    QuestionTemplateRelationMultipleChoiceForm,
  readonly: false,
  creatable: true,
  icon: <RadioButtonCheckedIcon />,
  renderers: {
    answerRenderer: ({ answer }) => <span>{answer.value.join(', ')}</span>,
    questionRenderer: defaultRenderer.questionRenderer,
  },
  createYupValidationSchema: createMultipleChoiceValidationSchema,
  getYupInitialValue: ({ answer }) => answer.value || [],
  searchCriteriaComponent: MultipleChoiceSearchCriteriaComponent,
};
