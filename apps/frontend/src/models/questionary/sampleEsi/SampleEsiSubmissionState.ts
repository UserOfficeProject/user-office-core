import { immerable } from 'immer';

import { Questionary, TemplateGroupId } from 'generated/sdk';

import { SampleEsiWithQuestionary } from './SampleEsiWithQuestionary';
import { QuestionarySubmissionState } from '../QuestionarySubmissionState';

export class SampleEsiSubmissionState extends QuestionarySubmissionState {
  [immerable] = true;
  constructor(public esi: SampleEsiWithQuestionary) {
    super(TemplateGroupId.SAMPLE_ESI, esi);
    this.stepIndex = this.getInitialStepIndex();
  }

  getItemId(): [number, number] {
    return [this.esi.esiId, this.esi.sampleId];
  }
  get itemWithQuestionary() {
    return this.esi;
  }

  set itemWithQuestionary(item: { questionary: Questionary }) {
    this.esi = { ...this.esi, ...item };
  }
}
