import { ProposalSubmissionState } from 'models/questionary/proposal/ProposalSubmissionState';
import { ProposalWithQuestionary } from 'models/questionary/proposal/ProposalWithQuestionary';
import { QuestionarySubmissionState } from 'models/questionary/QuestionarySubmissionState';
import { isCallEnded } from 'utils/helperFunctions';

import { QuestionaryWizardStep } from '../../DefaultWizardStepFactory';

export class ProposalQuestionaryWizardStep extends QuestionaryWizardStep {
  isItemWithQuestionaryEditable(state: QuestionarySubmissionState) {
    const { proposal } = state as ProposalSubmissionState;

    const callHasEnded = isCallEnded(
      proposal.call?.startCall,
      proposal.call?.endCall
    );
    const proposalStatus = this.getProposalStatus(proposal);

    if (proposalStatus === 'EDITABLE_SUBMITTED') {
      return true;
    }

    if (callHasEnded) {
      return false;
    } else {
      return proposalStatus === 'DRAFT';
    }
  }

  private getProposalStatus(proposal: ProposalWithQuestionary) {
    if (proposal.status != null) {
      return proposal.status.shortCode.toString();
    } else {
      return 'Proposal Status is null';
    }
  }
}
