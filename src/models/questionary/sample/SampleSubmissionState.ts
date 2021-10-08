import { immerable } from 'immer';

import { Questionary } from 'generated/sdk';

import {
  QuestionarySubmissionState,
  WizardStep,
} from '../QuestionarySubmissionState';
import { SampleWithQuestionary } from './SampleWithQuestionary';
export class SampleSubmissionState extends QuestionarySubmissionState {
  [immerable] = true;
  constructor(
    public sample: SampleWithQuestionary,
    stepIndex: number,
    isDirty: boolean,
    wizardSteps: WizardStep[]
  ) {
    super(stepIndex, isDirty, wizardSteps);
  }

  get itemWithQuestionary() {
    return this.sample;
  }

  set itemWithQuestionary(item: { questionary: Questionary }) {
    this.sample = { ...this.sample, ...item };
  }
}
