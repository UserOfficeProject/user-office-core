import { immerable } from 'immer';

import { Questionary, TemplateGroupId } from 'generated/sdk';

import { SampleWithQuestionary } from './SampleWithQuestionary';
import { QuestionarySubmissionState } from '../QuestionarySubmissionState';
export class SampleSubmissionState extends QuestionarySubmissionState {
  [immerable] = true;
  constructor(public sample: SampleWithQuestionary) {
    super(TemplateGroupId.SAMPLE, sample);
    this.stepIndex = this.getInitialStepIndex();
  }

  getItemId(): number {
    return this.sample.id;
  }

  get itemWithQuestionary() {
    return this.sample;
  }

  set itemWithQuestionary(item: { questionary: Questionary }) {
    this.sample = { ...this.sample, ...item };
  }
}
