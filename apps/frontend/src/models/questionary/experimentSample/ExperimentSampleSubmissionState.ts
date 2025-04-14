import { immerable } from 'immer';

import { Questionary, TemplateGroupId } from 'generated/sdk';

import { ExperimentSampleWithQuestionary } from './ExperimentSampleWithQuestionary';
import { QuestionarySubmissionState } from '../QuestionarySubmissionState';

export class ExperimentSampleSubmissionState extends QuestionarySubmissionState {
  [immerable] = true;
  constructor(public experimentSample: ExperimentSampleWithQuestionary) {
    super(TemplateGroupId.SAMPLE_ESI, experimentSample);
    this.stepIndex = this.getInitialStepIndex();
  }

  getItemId(): [number, number] {
    return [this.experimentSample.experimentPk, this.experimentSample.sampleId];
  }
  get itemWithQuestionary() {
    return this.experimentSample;
  }

  set itemWithQuestionary(item: { questionary: Questionary }) {
    this.experimentSample = { ...this.experimentSample, ...item };
  }
}
