import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { ProposalDataSource } from '../../datasources/ProposalDataSource';
import { ProposalEndStatus } from '../../models/Proposal';
import { Entity, GuardFn } from '../simpleStateMachine/stateMachnine';

export const isProposalReservedGuard: GuardFn = async (entity: Entity) => {
  const proposalDataSource = container.resolve<ProposalDataSource>(
    Tokens.ProposalDataSource
  );

  const proposal = await proposalDataSource.get(entity.id);

  if (!proposal) {
    throw new Error(`Proposal with pk ${entity.id} not found`);
  }

  return proposal.finalStatus === ProposalEndStatus.RESERVED;
};
