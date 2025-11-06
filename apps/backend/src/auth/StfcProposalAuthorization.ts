import { injectable } from 'tsyringe';

import { ProposalAuthorization } from './ProposalAuthorization';
import { Proposal } from '../models/Proposal';
import { UserWithRole } from '../models/User';

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
