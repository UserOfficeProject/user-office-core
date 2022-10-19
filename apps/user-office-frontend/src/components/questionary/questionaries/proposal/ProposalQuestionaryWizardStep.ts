import { ProposalStatusDefaultShortCodes } from 'components/proposal/ProposalsSharedConstants';
import { ProposalSubmissionState } from 'models/questionary/proposal/ProposalSubmissionState';
import { ProposalWithQuestionary } from 'models/questionary/proposal/ProposalWithQuestionary';
import { QuestionarySubmissionState } from 'models/questionary/QuestionarySubmissionState';
import { isCallEnded } from 'utils/helperFunctions';

import { QuestionaryWizardStep } from '../../DefaultWizardStepFactory';

export class ProposalQuestionaryWizardStep extends QuestionaryWizardStep {
  isItemWithQuestionaryEditable(state: QuestionarySubmissionState) {
    const { proposal } = state as ProposalSubmissionState;
    const isCallInternalActive = proposal.call?.isActiveInternal ?? false;
    const callHasEnded = isCallEnded(
      proposal.call?.startCall,
      proposal.call?.endCall
    );
    const proposalStatus = this.getProposalStatus(proposal);

    if (
      proposalStatus === ProposalStatusDefaultShortCodes.EDITABLE_SUBMITTED ||
      proposalStatus ===
        ProposalStatusDefaultShortCodes.EDITABLE_SUBMITTED_INTERNAL
    ) {
      return true;
    }

    if (callHasEnded && !isCallInternalActive) {
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
