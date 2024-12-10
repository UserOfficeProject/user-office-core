import { injectable } from 'tsyringe';

import { Proposal } from '../models/Proposal';
import { UserWithRole } from '../models/User';
import { ProposalAuthorization } from './ProposalAuthorization';

@injectable()
export class StfcProposalAuthorization extends ProposalAuthorization {
  async hasReadRights(
    agent: UserWithRole | null,
    proposalOrProposalId: Proposal | number
  ): Promise<boolean> {
    if (this.userAuth.isInstrumentScientist(agent)) {
      return true;
    } else {
      return super.hasReadRights(agent, proposalOrProposalId);
    }
  }
}
