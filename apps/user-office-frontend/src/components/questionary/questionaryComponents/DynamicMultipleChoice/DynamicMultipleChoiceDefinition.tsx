import HttpIcon from '@mui/icons-material/Http';
import React from 'react';

import defaultRenderer from 'components/questionary/DefaultQuestionRenderer';
import DynamicMultipleChoiceSearchCriteriaComponent from 'components/questionary/questionaryComponents/DynamicMultipleChoice/DynamicMultipleChoiceSearchCriteriaComponent';
import { DataType } from 'generated/sdk';

import { QuestionaryComponentDefinition } from '../../QuestionaryComponentRegistry';
import DynamicMultipleChoiceAnswerRenderer from './DynamicMultipleChoiceAnswerRenderer';
import { QuestionaryComponentDynamicMultipleChoice } from './QuestionaryComponentDynamicMultipleChoice';
import { QuestionDynamicMultipleChoiceForm } from './QuestionDynamicMultipleChoiceForm';
import { QuestionTemplateRelationDynamicMultipleChoiceForm } from './QuestionTemplateRelationDynamicMultipleChoiceForm';

export const dynamicMultipleChoiceDefinition: QuestionaryComponentDefinition = {
  dataType: DataType.DYNAMIC_MULTIPLE_CHOICE,
  name: 'Dynamic Multiple choice',
  questionaryComponent: QuestionaryComponentDynamicMultipleChoice,
  questionForm: () => QuestionDynamicMultipleChoiceForm,
  questionTemplateRelationForm: () =>
    QuestionTemplateRelationDynamicMultipleChoiceForm,
  readonly: false,
  creatable: true,
  icon: <HttpIcon />,
  renderers: {
    answerRenderer: DynamicMultipleChoiceAnswerRenderer,
    questionRenderer: defaultRenderer.questionRenderer,
  },
  createYupValidationSchema: null, //TODO: Create dynamicMultipleChoiceValidationSchema on @user-office-software/duo-validation and put here.
  getYupInitialValue: ({ answer }) => answer.value || [],
  searchCriteriaComponent: DynamicMultipleChoiceSearchCriteriaComponent,
};
