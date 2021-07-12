import { GetShipmentQuery, ShipmentFragment } from 'generated/sdk';

import { SampleFragment } from './../generated/sdk';
import { QuestionarySubmissionState } from './QuestionarySubmissionState';

export type ShipmentBasic = ShipmentFragment;

export type ShipmentExtended = Exclude<GetShipmentQuery['shipment'], null>;
export interface ShipmentSubmissionState extends QuestionarySubmissionState {
  shipment: ShipmentExtended;
}

export interface ShipmentBasisFormikData {
  title: string;
  proposalPk: number;
  samples: SampleFragment[];
}
