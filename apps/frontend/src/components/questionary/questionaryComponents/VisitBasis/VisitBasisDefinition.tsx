import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import React from 'react';

import { DataType } from 'generated/sdk';
import { VisitRegistrationSubmissionState } from 'models/questionary/visit/VisitRegistrationSubmissionState';

import { createVisitBasisValidationSchema } from './createVisitBasisValidationSchema';
import { QuestionaryComponentVisitBasis } from './QuestionaryComponentVisitBasis';
import { QuestionTemplateRelationVisitBasisForm } from './QuestionTemplateRelationVisitBasisForm';
import { QuestionVisitBasisForm } from './QuestionVisitBasisForm';
import { QuestionaryComponentDefinition } from '../../QuestionaryComponentRegistry';

export const visitBasisDefinition: QuestionaryComponentDefinition = {
  dataType: DataType.VISIT_BASIS,
  name: 'Visit Basis',
  questionaryComponent: QuestionaryComponentVisitBasis,
  questionForm: () => QuestionVisitBasisForm,
  questionTemplateRelationForm: () => QuestionTemplateRelationVisitBasisForm,
  readonly: true,
  creatable: false,
  icon: <FlightTakeoffIcon />,
  createYupValidationSchema: createVisitBasisValidationSchema,
  getYupInitialValue: ({ state }) => {
    const visitState = state as VisitRegistrationSubmissionState;

    return visitState.registration;
  },
};
