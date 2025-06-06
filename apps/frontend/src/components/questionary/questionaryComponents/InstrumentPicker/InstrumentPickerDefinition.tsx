import { instrumentPickerValidationSchema } from '@user-office-software/duo-validation';
import React from 'react';

import ScienceIcon from 'components/common/icons/ScienceIcon';
import defaultRenderer from 'components/questionary/DefaultQuestionRenderer';
import { DataType, InstrumentPickerConfig } from 'generated/sdk';

import InstrumentPickerAnswerRenderer from './InstrumentPickerAnswerRenderer';
import InstrumentPickerSearchCriteriaComponent from './InstrumentPickerSearchCriteriaComponent';
import {
  processInstrumentPickerValue,
  QuestionaryComponentInstrumentPicker,
} from './QuestionaryComponentInstrumentPicker';
import { QuestionInstrumentPickerForm } from './QuestionInstrumentPickerForm';
import { QuestionTemplateRelationInstrumentPickerForm } from './QuestionTemplateRelationInstrumentPickerForm';
import { QuestionaryComponentDefinition } from '../../QuestionaryComponentRegistry';

export const instrumentPickerDefinition: QuestionaryComponentDefinition = {
  dataType: DataType.INSTRUMENT_PICKER,
  name: 'Instrument Picker',
  questionaryComponent: QuestionaryComponentInstrumentPicker,
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
  getYupInitialValue: ({ answer }) => {
    if (answer && answer.config) {
      const config = answer.config as InstrumentPickerConfig;

      return processInstrumentPickerValue(answer, config);
    }

    return null;
  },
  searchCriteriaComponent: InstrumentPickerSearchCriteriaComponent,
};

export {};
