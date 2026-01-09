import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { CallDataSource } from '../../datasources/CallDataSource';
import { ProposalDataSource } from '../../datasources/ProposalDataSource';
import { Entity, GuardFn } from '../simpleStateMachine/stateMachnine';

export const isCallEndedGuard: GuardFn = async (entity: Entity) => {
  const proposalDataSource = container.resolve<ProposalDataSource>(
    Tokens.ProposalDataSource
  );
  const proposal = await proposalDataSource.get(entity.id);

  if (!proposal) {
    return false;
  }

  const callDataSource = container.resolve<CallDataSource>(
    Tokens.CallDataSource
  );
  const call = await callDataSource.getCall(proposal.callId);

  if (!call) {
    return false;
  }

  return call.callEnded;
};
