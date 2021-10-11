import { immerable } from 'immer';

import { Questionary } from 'generated/sdk';

import {
  QuestionarySubmissionState,
  WizardStep,
} from '../QuestionarySubmissionState';
import { SampleEsiWithQuestionary } from './SampleEsiWithQuestionary';

export class SampleEsiSubmissionState extends QuestionarySubmissionState {
  [immerable] = true;
  constructor(
    public esi: SampleEsiWithQuestionary,
    stepIndex: number,
    isDirty: boolean,
    wizardSteps: WizardStep[]
  ) {
    super(stepIndex, isDirty, wizardSteps);
  }

  get itemWithQuestionary() {
    return this.esi;
  }

  set itemWithQuestionary(item: { questionary: Questionary }) {
    this.esi = { ...this.esi, ...item };
  }
}
