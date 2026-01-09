import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { FapDataSource } from '../../datasources/FapDataSource';
import { Entity, GuardFn } from '../simpleStateMachine/stateMachnine';

export const isProposalFapMeetingInstrumentUnsubmittedGuard: GuardFn = async (
  entity: Entity
) => {
  const fapDataSource = container.resolve<FapDataSource>(Tokens.FapDataSource);

  const fapProposals = await fapDataSource.getFapsByProposalPks([entity.id]);

  if (fapProposals.length === 0) {
    return false;
  }

  return fapProposals.every((fp) => !fp.fapInstrumentMeetingSubmitted);
};
