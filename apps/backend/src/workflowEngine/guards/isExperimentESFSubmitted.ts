import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { ExperimentDataSource } from '../../datasources/ExperimentDataSource';
import { Entity, GuardFn } from '../stateMachine/stateMachine';

export const isExperimentESFSubmitted: GuardFn = async (entity: Entity) => {
  const experimentDataSource = container.resolve<ExperimentDataSource>(
    Tokens.ExperimentDataSource
  );

  const experimentSafety = await experimentDataSource.getExperimentSafety(
    entity.id
  );

  return !!experimentSafety?.esiQuestionarySubmittedAt;
};
