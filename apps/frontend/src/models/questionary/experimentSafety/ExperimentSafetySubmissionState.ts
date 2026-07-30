import { immerable } from 'immer';

import { Questionary, TemplateGroupId } from 'generated/sdk';

import { ExperimentSafetyWithQuestionary } from './ExperimentSafetyWithQuestionary';
import { QuestionarySubmissionState } from '../QuestionarySubmissionState';

export class ExperimentSafetySubmissionState extends QuestionarySubmissionState {
  [immerable] = true;
  constructor(
    public experimentSafety: ExperimentSafetyWithQuestionary,
    public previewMode: boolean | undefined
  ) {
    super(TemplateGroupId.PROPOSAL_ESI, experimentSafety, previewMode);
    this.stepIndex = this.getInitialStepIndex();
  }

  getItemId(): number {
    return this.experimentSafety.experimentPk;
  }

  get itemWithQuestionary() {
    return this.experimentSafety;
  }

  set itemWithQuestionary(item: { questionary: Questionary }) {
    this.experimentSafety = { ...this.experimentSafety, ...item };
  }
}
