import { immerable } from 'immer';

import { Questionary } from 'generated/sdk';

import { ExperimentSafetyWithQuestionary } from './ExperimentSafetyWithQuestionary';
import { TemplateGroupId } from '../../../generated/sdk';
import { QuestionarySubmissionState } from '../QuestionarySubmissionState';

export class ExperimentSafetySubmissionState extends QuestionarySubmissionState {
  [immerable] = true;
  constructor(public experimentSafety: ExperimentSafetyWithQuestionary) {
    super(TemplateGroupId.PROPOSAL_ESI, experimentSafety);
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
