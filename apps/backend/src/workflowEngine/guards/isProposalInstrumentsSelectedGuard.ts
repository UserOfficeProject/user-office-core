import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { InstrumentDataSource } from '../../datasources/InstrumentDataSource';
import { Entity, GuardFn } from '../simpleStateMachine/stateMachnine';

export const isProposalInstrumentsSelectedGuard: GuardFn = async (
  entity: Entity
) => {
  const instrumentDs = container.resolve<InstrumentDataSource>(
    Tokens.InstrumentDataSource
  );

  const instruments = await instrumentDs.getInstrumentsByProposalPk(entity.id);

  return instruments.length > 0;
};
