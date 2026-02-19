import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { ProposalDataSource } from '../../datasources/ProposalDataSource';
import { Entity, GuardFn } from '../simpleStateMachine/stateMachnine';

export const isProposalSubmittedGuard: GuardFn = async (
  entity: Entity
): Promise<boolean> => {
  const proposalDs = container.resolve<ProposalDataSource>(
    Tokens.ProposalDataSource
  );

  const proposal = await proposalDs.get(entity.id);

  if (!proposal) {
    throw new Error(`Proposal with pk ${entity.id} not found`);
  }

  return proposal.submitted;
};
