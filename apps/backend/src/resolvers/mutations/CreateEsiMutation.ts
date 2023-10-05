import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { ExperimentSafetyInput } from '../types/ExperimentSafetyInput';

@Resolver()
export class CreateEsiMutation {
  @Mutation(() => ExperimentSafetyInput)
  createEsi(
    @Arg('scheduledEventId', () => Int) scheduledEventId: number,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.proposalEsi.createEsi(
      context.user,
      scheduledEventId
    );
  }
}
