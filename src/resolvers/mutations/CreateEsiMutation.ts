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
import { EsiResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@ArgsType()
export class CreateEsiArgs {
  @Field(() => Int)
  visitId: number;
}

@Resolver()
export class CreateEsiMutation {
  @Mutation(() => EsiResponseWrap)
  createEsi(@Args() args: CreateEsiArgs, @Ctx() context: ResolverContext) {
    return wrapResponse(
      context.mutations.proposalEsi.createEsi(context.user, args),
      EsiResponseWrap
    );
  }
}
