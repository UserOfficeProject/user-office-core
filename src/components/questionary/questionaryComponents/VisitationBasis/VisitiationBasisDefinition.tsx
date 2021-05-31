import FlightTakeoffIcon from '@material-ui/icons/FlightTakeoff';
import React from 'react';

import { DataType } from 'generated/sdk';
import { VisitationSubmissionState } from 'models/VisitationSubmissionState';

import { QuestionaryComponentDefinition } from '../../QuestionaryComponentRegistry';
import { createVisitationBasisValidationSchema } from './createVisitationBasisValidationSchema';
import { QuestionaryComponentVisitationBasis } from './QuestionaryComponentVisitationBasis';
import { QuestionTemplateRelationVisitationBasisForm } from './QuestionTemplateRelationVisitationBasisForm';
import { QuestionVisitationBasisForm } from './QuestionVisitationBasisForm';

export const visitationBasisDefinition: QuestionaryComponentDefinition = {
  dataType: DataType.VISITATION_BASIS,
  name: 'Visitation Basis',
  questionaryComponent: QuestionaryComponentVisitationBasis,
  questionForm: () => QuestionVisitationBasisForm,
  questionTemplateRelationForm: () =>
    QuestionTemplateRelationVisitationBasisForm,
  readonly: true,
  creatable: false,
  icon: <FlightTakeoffIcon />,
  createYupValidationSchema: createVisitationBasisValidationSchema,
  getYupInitialValue: ({ state }) => {
    const visitationState = state as VisitationSubmissionState;

    return visitationState.visitation;
  },
};
