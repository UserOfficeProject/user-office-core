import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { SampleDataSource } from '../../datasources/SampleDataSource';
import { SampleStatus } from '../../models/Sample';
import { Entity, GuardFn } from '../simpleStateMachine/stateMachnine';

export const isProposalSampleSafeGuard: GuardFn = async (entity: Entity) => {
  const sampleDataSource = container.resolve<SampleDataSource>(
    Tokens.SampleDataSource
  );

  const samples = await sampleDataSource.getSamples({
    filter: { proposalPk: entity.id },
  });

  if (samples.length === 0) {
    return false;
  }

  return samples.some(
    (sample) => sample.safetyStatus === SampleStatus.LOW_RISK
  );
};
