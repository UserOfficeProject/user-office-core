import { immerable } from 'immer';

import { Questionary, SampleFragment } from 'generated/sdk';

import { QuestionarySubmissionState } from '../QuestionarySubmissionState';
import { TemplateGroupId } from './../../../generated/sdk';
import { ShipmentWithQuestionary } from './ShipmentWithQuestionary';

export class ShipmentSubmissionState extends QuestionarySubmissionState {
  [immerable] = true;

  constructor(public shipment: ShipmentWithQuestionary) {
    super(TemplateGroupId.SHIPMENT, shipment);
    this.stepIndex = this.getInitialStepIndex();
  }

  getItemId(): number {
    return this.shipment.id;
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
