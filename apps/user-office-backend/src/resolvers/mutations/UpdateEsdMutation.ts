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
export class UpdateEsdArgs {
  @Field(() => Int)
  esdId: number;

  @Field(() => EsdEvaluation)
  evaluation: EsdEvaluation;

  @Field(() => String)
  comment: string;
}

@Resolver()
export class UpdateEsdMutation {
  @Mutation(() => ExperimentSafetyDocument)
  updateEsd(@Args() args: UpdateEsdArgs, @Ctx() context: ResolverContext) {
    return context.mutations.proposalEsd.updateEsd(context.user, args);
  }
}
