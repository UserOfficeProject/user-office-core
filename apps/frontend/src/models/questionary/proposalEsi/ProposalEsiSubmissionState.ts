import { immerable } from 'immer';

import { Questionary } from 'generated/sdk';

import { TemplateGroupId } from './../../../generated/sdk';
import { ProposalEsiWithQuestionary } from './ProposalEsiWithQuestionary';
import { QuestionarySubmissionState } from '../QuestionarySubmissionState';

export class ProposalEsiSubmissionState extends QuestionarySubmissionState {
  [immerable] = true;
  constructor(public esi: ProposalEsiWithQuestionary) {
    super(TemplateGroupId.PROPOSAL_ESI, esi);
    this.stepIndex = this.getInitialStepIndex();
  }

  getItemId(): number {
    return this.esi.id;
  }

  get itemWithQuestionary() {
    return this.esi;
  }

  set itemWithQuestionary(item: { questionary: Questionary }) {
    this.esi = { ...this.esi, ...item };
  }
}
