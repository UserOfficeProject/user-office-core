import { immerable } from 'immer';

import { SampleFragment } from 'generated/sdk';

import { QuestionarySubmissionState } from '../QuestionarySubmissionState';

export class ExperimentSafetyState extends QuestionarySubmissionState {
  [immerable] = true;

  // constructor(public shipment: ShipmentWithQuestionary) {
  //   super(TemplateGroupId.SHIPMENT, shipment);
  //   this.stepIndex = this.getInitialStepIndex();
  // }

  getItemId(): number {
    return 1;
  }

  get itemWithQuestionary() {
    return {};
  }

  // set itemWithQuestionary(item: { questionary: Questionary }) {
  //   this.shipment = { ...this.shipment, ...item };
  // }
}

export interface ShipmentBasisFormikData {
  title: string;
  proposalPk: number;
  samples: SampleFragment[];
}
