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
import { EsdResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@ArgsType()
export class CreateEsdArgs {
  @Field(() => Int)
  esiId: number;

  @Field(() => EsdEvaluation)
  evaluation: EsdEvaluation;
}

@Resolver()
export class CreateEsdMutation {
  @Mutation(() => EsdResponseWrap)
  createEdi(@Args() args: CreateEsdArgs, @Ctx() context: ResolverContext) {
    return wrapResponse(
      context.mutations.proposalEsd.createEsd(context.user, args),
      EsdResponseWrap
    );
  }
}
