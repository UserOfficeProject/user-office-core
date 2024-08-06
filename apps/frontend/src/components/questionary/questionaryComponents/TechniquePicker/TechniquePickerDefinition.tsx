import { Science } from '@mui/icons-material';
import { techniquePickerValidationSchema } from '@user-office-software/duo-validation';
import React from 'react';

import defaultRenderer from 'components/questionary/DefaultQuestionRenderer';
import { DataType } from 'generated/sdk';

import { QuestionaryComponentTechniquePicker } from './QuestionaryComponentTechniquePicker';
import { QuestionTechniquePickerForm } from './QuestionTechniquePickerForm';
import { QuestionTemplateRelationTechniquePickerForm } from './QuestionTemplateRelationTechniquePickerForm';
import TechniquePickerAnswerRenderer from './TechniquePickerAnswerRenderer';
import TechniquePickerSearchCriteriaComponent from './TechniquePickerSearchCriteriaComponent';
import { QuestionaryComponentDefinition } from '../../QuestionaryComponentRegistry';

export const techniquePickerDefinition: QuestionaryComponentDefinition = {
  dataType: DataType.TECHNIQUE_PICKER,
  name: 'Technique Picker',
  questionaryComponent: QuestionaryComponentTechniquePicker,
  questionForm: () => QuestionTechniquePickerForm,
  questionTemplateRelationForm: () =>
    QuestionTemplateRelationTechniquePickerForm,
  readonly: false,
  creatable: true,
  icon: <Science />,
  renderers: {
    answerRenderer: (answer) => <TechniquePickerAnswerRenderer {...answer} />,
    questionRenderer: defaultRenderer.questionRenderer,
  },
  createYupValidationSchema: techniquePickerValidationSchema,
  getYupInitialValue: ({ answer }) => answer.value || null,
  searchCriteriaComponent: TechniquePickerSearchCriteriaComponent,
};

export {};
