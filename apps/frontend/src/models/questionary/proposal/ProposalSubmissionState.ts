import { immerable } from 'immer';

import { ProposalStatusDefaultShortCodes } from 'components/proposal/ProposalsSharedConstants';
import { Questionary, TemplateGroupId } from 'generated/sdk';

import { ProposalWithQuestionary } from './ProposalWithQuestionary';
import { QuestionarySubmissionState } from '../QuestionarySubmissionState';

export class ProposalSubmissionState extends QuestionarySubmissionState {
  [immerable] = true;
  constructor(
    public proposal: ProposalWithQuestionary,
    public isPreviewMode: boolean | undefined
  ) {
    super(TemplateGroupId.PROPOSAL, proposal, isPreviewMode);
    this.stepIndex = this.getInitialStepIndex();
  }

  getItemId(): number {
    return this.proposal.primaryKey;
  }

  get itemWithQuestionary() {
    return this.proposal;
  }

  set itemWithQuestionary(item: { questionary: Questionary }) {
    this.proposal = { ...this.proposal, ...item };
  }

  getInitialStepIndex(): number {
    if (
      this.proposal?.status?.shortCode.toString() ==
        ProposalStatusDefaultShortCodes.EDITABLE_SUBMITTED ||
      this.proposal?.status?.shortCode.toString() ==
        ProposalStatusDefaultShortCodes.EDITABLE_SUBMITTED_INTERNAL
    ) {
      return 0;
    }

    return super.getInitialStepIndex();
  }
}
