import React from 'react';

import EsiIcon from 'components/common/icons/EsiIcon';
import { DataType } from 'generated/sdk';
import { SampleEsiSubmissionState } from 'models/questionary/experimentSample/SampleEsiSubmissionState';

import { createSampleEsiBasisValidationSchema } from './createSampleEsiValidationSchema';
import { QuestionSampleEsiBasisForm } from './QuestionSampleEsiBasisForm';
import { QuestionTemplateRelationSampleEsiBasisForm } from './QuestionTemplateRelationSampleEsiBasisForm';
import { QuestionaryComponentDefinition } from '../../QuestionaryComponentRegistry';

export const sampleEsiBasisDefinition: QuestionaryComponentDefinition = {
  dataType: DataType.SAMPLE_ESI_BASIS,
  name: 'Sample ESI Basis',
  questionaryComponent: null,
  questionForm: () => QuestionSampleEsiBasisForm,
  questionTemplateRelationForm: () =>
    QuestionTemplateRelationSampleEsiBasisForm,
  readonly: true,
  creatable: false,
  icon: <EsiIcon />,
  createYupValidationSchema: createSampleEsiBasisValidationSchema,
  getYupInitialValue: ({ state }) => {
    const esiState = state as SampleEsiSubmissionState;

    return esiState.esi;
  },
};
