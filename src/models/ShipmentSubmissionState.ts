import { immerable } from 'immer';

import { GetShipmentQuery, Questionary, ShipmentFragment } from 'generated/sdk';

import { SampleFragment } from './../generated/sdk';
import {
  QuestionarySubmissionState,
  WizardStep,
} from './QuestionarySubmissionState';

export type ShipmentBasic = ShipmentFragment;

export type ShipmentExtended = Exclude<GetShipmentQuery['shipment'], null>;
export class ShipmentSubmissionState extends QuestionarySubmissionState {
  [immerable] = true;

  constructor(
    public shipment: ShipmentExtended,
    stepIndex: number,
    isDirty: boolean,
    wizardSteps: WizardStep[]
  ) {
    super(stepIndex, isDirty, wizardSteps);
  }

  get itemWithQuestionary() {
    return this.shipment;
  }

  set itemWithQuestionary(item: { questionary: Questionary }) {
    this.shipment = { ...this.shipment, ...item };
  }
}

export interface ShipmentBasisFormikData {
  title: string;
  proposalPk: number;
  samples: SampleFragment[];
}
