import { instrumentPickerValidationSchema } from '@user-office-software/duo-validation';
import React from 'react';

import ScienceIcon from 'components/common/icons/ScienceIcon';
import defaultRenderer from 'components/questionary/DefaultQuestionRenderer';
import { DataType } from 'generated/sdk';

import { QuestionaryComponentTechniquePicker } from './QuestionaryComponentTechniquePicker';
import { QuestionaryComponentDefinition } from '../../QuestionaryComponentRegistry';

export const techniquePickerDefinition: QuestionaryComponentDefinition = {
  dataType: DataType.TECHNIQUE_PICKER,
  name: 'Technique Picker',
  questionaryComponent: QuestionaryComponentTechniquePicker,
  questionForm: () => QuestionInstrumentPickerForm,
  questionTemplateRelationForm: () =>
    QuestionTemplateRelationInstrumentPickerForm,
  readonly: false,
  creatable: true,
  icon: <ScienceIcon />,
  renderers: {
    answerRenderer: (answer) => <InstrumentPickerAnswerRenderer {...answer} />,
    questionRenderer: defaultRenderer.questionRenderer,
  },
  createYupValidationSchema: instrumentPickerValidationSchema,
  getYupInitialValue: ({ answer }) => answer.value || null,
  searchCriteriaComponent: InstrumentPickerSearchCriteriaComponent,
};

export {};
