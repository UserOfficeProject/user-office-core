import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { ExperimentDataSource } from '../../datasources/ExperimentDataSource';
import { ExperimentStatus } from '../../models/Experiment';
import { Entity, GuardFn } from '../simpleStateMachine/stateMachnine';

export const isProposalBookingTimeCompletedGuard: GuardFn = async (
  entity: Entity
) => {
  const experimentDataSource = container.resolve<ExperimentDataSource>(
    Tokens.ExperimentDataSource
  );

  const experiments = await experimentDataSource.getExperimentsByProposalPk(
    entity.id
  );

  if (experiments.length === 0) {
    return false;
  }

  return experiments.every(
    (experiment) => experiment.status === ExperimentStatus.COMPLETED
  );
};
