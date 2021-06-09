import FlightTakeoffIcon from '@material-ui/icons/FlightTakeoff';
import React from 'react';

import { DataType } from 'generated/sdk';
import { VisitSubmissionState } from 'models/VisitSubmissionState';

import { QuestionaryComponentDefinition } from '../../QuestionaryComponentRegistry';
import { createVisitBasisValidationSchema } from './createVisitBasisValidationSchema';
import { QuestionaryComponentVisitBasis } from './QuestionaryComponentVisitBasis';
import { QuestionTemplateRelationVisitBasisForm } from './QuestionTemplateRelationVisitBasisForm';
import { QuestionVisitBasisForm } from './QuestionVisitBasisForm';

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
    const visitState = state as VisitSubmissionState;

    return visitState.visit;
  },
};
