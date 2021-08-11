import { QuestionaryStep } from 'generated/sdk';
import { ProposalSubmissionState } from 'models/questionary/proposal/ProposalSubmissionState';
import { ProposalWithQuestionary } from 'models/questionary/proposal/ProposalWithQuestionary';
import { QuestionarySubmissionState } from 'models/questionary/QuestionarySubmissionState';

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

  private getProposalStatus(proposal: ProposalWithQuestionary) {
    if (proposal.status != null) {
      return proposal.status.shortCode.toString();
    } else {
      return 'Proposal Status is null';
    }
  }
}
