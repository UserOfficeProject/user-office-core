import { GetShipmentQuery, ShipmentFragment } from 'generated/sdk';

import { QuestionarySubmissionState } from './QuestionarySubmissionState';
import { SampleBasic } from './Sample';

export type ShipmentBasic = ShipmentFragment;

export type ShipmentExtended = Exclude<GetShipmentQuery['shipment'], null>;

export interface ShipmentSubmissionState extends QuestionarySubmissionState {
  shipment: ShipmentExtended;
}

export interface ShipmentBasisFormikData {
  title: string;
  proposalId: number | '';
  samples: SampleBasic[];
}
