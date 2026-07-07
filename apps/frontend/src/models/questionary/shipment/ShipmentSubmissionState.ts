import { immerable } from 'immer';

import { Questionary, SampleFragment, TemplateGroupId } from 'generated/sdk';

import { ShipmentWithQuestionary } from './ShipmentWithQuestionary';
import { QuestionarySubmissionState } from '../QuestionarySubmissionState';

export class ShipmentSubmissionState extends QuestionarySubmissionState {
  [immerable] = true;

  constructor(
    public shipment: ShipmentWithQuestionary,
    public previewMode: boolean | undefined
  ) {
    super(TemplateGroupId.SHIPMENT, shipment, previewMode);
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
