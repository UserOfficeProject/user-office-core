import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { FapDataSource } from '../../datasources/FapDataSource';
import { Entity, GuardFn } from '../simpleStateMachine/stateMachnine';

export const isProposalFapsSelectedGuard: GuardFn = async (entity: Entity) => {
  const fapDataSource = container.resolve<FapDataSource>(Tokens.FapDataSource);

  const faps = await fapDataSource.getFapsByProposalPk(entity.id);

  return faps.length > 0;
};
