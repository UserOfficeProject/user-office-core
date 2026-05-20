import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { FapDataSource } from '../../datasources/FapDataSource';
import { Entity, GuardFn } from '../stateMachine/stateMachnine';

/**
 * Returns true when every FAP linked to the proposal has its instrument meeting submitted.
 */
export const isEveryFapInstrumentMeetingSubmittedGuard: GuardFn = async (
  entity: Entity
) => {
  const fapDataSource = container.resolve<FapDataSource>(Tokens.FapDataSource);

  const fapProposals = await fapDataSource.getFapsByProposalPks([entity.id]);

  if (fapProposals.length === 0) {
    return false;
  }

  return fapProposals.every(
    (fapProposal) => fapProposal.fapInstrumentMeetingSubmitted
  );
};
