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
import { EsdEvaluation } from '../../models/EsdEvaluation';
import { ExperimentSafetyDocument } from '../types/ExperimentSafetyDocument';

@ArgsType()
export class CreateEsdArgs {
  @Field(() => Int)
  esiId: number;

  @Field(() => EsdEvaluation)
  evaluation: EsdEvaluation;

  @Field(() => String)
  comment: string;
}

@Resolver()
export class CreateEsdMutation {
  @Mutation(() => ExperimentSafetyDocument)
  createEsd(@Args() args: CreateEsdArgs, @Ctx() context: ResolverContext) {
    return context.mutations.proposalEsd.createEsd(context.user, args);
  }
}
