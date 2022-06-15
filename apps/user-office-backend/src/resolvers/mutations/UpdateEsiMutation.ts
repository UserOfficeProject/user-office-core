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
export class UpdateEsiArgs {
  @Field(() => Int)
  esiId: number;

  @Field(() => Boolean, { nullable: true })
  isSubmitted?: boolean;
}

@Resolver()
export class UpdateEsiMutation {
  @Mutation(() => EsiResponseWrap)
  updateEsi(@Args() args: UpdateEsiArgs, @Ctx() context: ResolverContext) {
    return wrapResponse(
      context.mutations.proposalEsi.updateEsi(context.user, args),
      EsiResponseWrap
    );
  }
}
