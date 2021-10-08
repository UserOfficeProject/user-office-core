import { immerable } from 'immer';

import { Questionary, SampleFragment } from 'generated/sdk';

import {
  QuestionarySubmissionState,
  WizardStep,
} from '../QuestionarySubmissionState';
import { ShipmentWithQuestionary } from './ShipmentWithQuestionary';

export class ShipmentSubmissionState extends QuestionarySubmissionState {
  [immerable] = true;

  constructor(
    public shipment: ShipmentWithQuestionary,
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
