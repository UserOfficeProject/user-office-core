import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import { instrumentPickerValidationSchema } from '@user-office-software/duo-validation';
import React from 'react';

import defaultRenderer from 'components/questionary/DefaultQuestionRenderer';
import { DataType } from 'generated/sdk';

import { QuestionaryComponentDefinition } from '../../QuestionaryComponentRegistry';
import InstrumentPickerAnswerRenderer from './InstrumentPickerAnswerRenderer';
import InstrumentPickerSearchCriteriaComponent from './InstrumentPickerSearchCriteriaComponent';
import { QuestionaryComponentInstrumentPicker } from './QuestionaryComponentInstrumentPicker';
import { QuestionInstrumentPickerForm } from './QuestionInstrumentPickerForm';
import { QuestionTemplateRelationInstrumentPickerForm } from './QuestionTemplateRelationInstrumentPickerForm';

export const instrumentPickerDefinition: QuestionaryComponentDefinition = {
  dataType: DataType.INSTRUMENT_PICKER,
  name: 'Instrument Picker',
  questionaryComponent: QuestionaryComponentInstrumentPicker,
  questionForm: () => QuestionInstrumentPickerForm,
  questionTemplateRelationForm: () =>
    QuestionTemplateRelationInstrumentPickerForm,
  readonly: false,
  creatable: true,
  icon: <PrecisionManufacturingIcon />,
  renderers: {
    answerRenderer: (answer) => <InstrumentPickerAnswerRenderer {...answer} />,
    questionRenderer: defaultRenderer.questionRenderer,
  },
  createYupValidationSchema: instrumentPickerValidationSchema,
  getYupInitialValue: ({ answer }) => answer.value || null,
  searchCriteriaComponent: InstrumentPickerSearchCriteriaComponent,
};

export {};
