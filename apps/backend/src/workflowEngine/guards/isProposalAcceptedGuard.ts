import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { ProposalDataSource } from '../../datasources/ProposalDataSource';
import { ProposalEndStatus } from '../../models/Proposal';
import { Entity, GuardFn } from '../simpleStateMachine/stateMachnine';

export const isProposalAcceptedGuard: GuardFn = async (entity: Entity) => {
  const proposalDataSource = container.resolve<ProposalDataSource>(
    Tokens.ProposalDataSource
  );
  const proposal = await proposalDataSource.get(entity.id);

  if (!proposal) {
    return false;
  }

  return (
    proposal.finalStatus === ProposalEndStatus.ACCEPTED &&
    proposal.managementDecisionSubmitted
  );
};
