import { QuestionaryStep } from 'generated/sdk';
import { ProposalSubsetSubmission } from 'models/ProposalSubmissionState';
import { QuestionarySubmissionState } from 'models/QuestionarySubmissionState';

import { ProposalSubmissionState } from '../../../../models/ProposalSubmissionState';
import { QuestionaryWizardStep } from '../../DefaultWizardStepFactory';

export class ProposalQuestionaryWizardStep extends QuestionaryWizardStep {
  constructor(step: QuestionaryStep, index: number) {
    super(step, index);
  }
  isItemWithQuestionaryEditable(state: QuestionarySubmissionState) {
    const { proposal } = state as ProposalSubmissionState;

    const isCallActive = proposal.call?.isActive ?? true;

    return (
      isCallActive &&
      (!proposal.submitted ||
        this.getProposalStatus(proposal) === 'EDITABLE_SUBMITTED' ||
        this.getProposalStatus(proposal) === 'DRAFT')
    );
  }

  private getProposalStatus(proposal: ProposalSubsetSubmission) {
    if (proposal.status != null) {
      return proposal.status.shortCode.toString();
    } else {
      return 'Proposal Status is null';
    }
  }
}
