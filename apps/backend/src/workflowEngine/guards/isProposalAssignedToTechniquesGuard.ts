import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { TechniqueDataSource } from '../../datasources/TechniqueDataSource';
import { Entity, GuardFn } from '../simpleStateMachine/stateMachnine';

export const isProposalAssignedToTechniquesGuard: GuardFn = async (
  entity: Entity
) => {
  const techniqueDataSource = container.resolve<TechniqueDataSource>(
    Tokens.TechniqueDataSource
  );

  const techniques = await techniqueDataSource.getTechniquesByProposalPk(
    entity.id
  );

  return techniques.length > 0;
};
