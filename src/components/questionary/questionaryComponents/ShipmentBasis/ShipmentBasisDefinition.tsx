import LocalShippingIcon from '@material-ui/icons/LocalShipping';
import React from 'react';

import { DataType } from 'generated/sdk';
import {
  ShipmentBasisFormikData,
  ShipmentSubmissionState,
} from 'models/ShipmentSubmissionState';

import { QuestionaryComponentDefinition } from '../../QuestionaryComponentRegistry';
import { createShipmentBasisValidationSchema } from './createShipmentBasisValidationSchema';
import { QuestionaryComponentShipmentBasis } from './QuestionaryComponentShipmentBasis';
import { QuestionShipmentBasisForm } from './QuestionShipmentBasisForm';
import { QuestionTemplateRelationShipmentBasisForm } from './QuestionTemplateRelationShipmentBasisForm';

export const shipmentBasisDefinition: QuestionaryComponentDefinition = {
  dataType: DataType.SHIPMENT_BASIS,
  name: 'Shipment Basis',
  questionaryComponent: QuestionaryComponentShipmentBasis,
  questionForm: () => QuestionShipmentBasisForm,
  questionTemplateRelationForm: () => QuestionTemplateRelationShipmentBasisForm,
  readonly: true,
  creatable: false,
  icon: <LocalShippingIcon />,
  createYupValidationSchema: createShipmentBasisValidationSchema,
  getYupInitialValue: ({ state }): ShipmentBasisFormikData => {
    const shipmentState = state as ShipmentSubmissionState;

    return {
      title: shipmentState.shipment.title,
      proposalId: shipmentState.shipment.proposalId,
      samples: shipmentState.shipment.samples,
    };
  },
};
