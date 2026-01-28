import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { FapDataSource } from '../../datasources/FapDataSource';
import { Entity, GuardFn } from '../simpleStateMachine/stateMachnine';

export const isProposalAllFapReviewersSelectedGuard: GuardFn = async (
  entity: Entity
) => {
  const fapDataSource = container.resolve<FapDataSource>(Tokens.FapDataSource);

  const faps = await fapDataSource.getFapsByProposalPk(entity.id);
  const assignments = await fapDataSource.getAllFapProposalAssignments(
    entity.id
  );

  if (faps.length === 0) {
    return false;
  }

  return faps.every((fap) => {
    const fapAssignments = assignments.filter(
      (assignment) => assignment.fapId === fap.id
    );

    return fapAssignments.length >= fap.numberRatingsRequired;
  });
};
