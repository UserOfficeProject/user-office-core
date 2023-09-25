import {
  Args,
  ArgsType,
  Ctx,
  Field,
  Int,
  Mutation,
  Resolver,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { ExperimentSafetyInput } from '../types/ExperimentSafetyInput';

@ArgsType()
export class UpdateEsiArgs {
  @Field(() => Int)
  esiId: number;

  @Field(() => Boolean, { nullable: true })
  isSubmitted?: boolean;
}

@Resolver()
export class UpdateEsiMutation {
  @Mutation(() => ExperimentSafetyInput)
  updateEsi(@Args() args: UpdateEsiArgs, @Ctx() context: ResolverContext) {
    return context.mutations.proposalEsi.updateEsi(context.user, args);
  }
}
