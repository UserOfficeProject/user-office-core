import {
  Args,
  ArgsType,
  Ctx,
  Field,
  Mutation,
  Resolver,
  Int,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { SEP } from '../types/SEP';
import { ProposalPkWithCallId } from './ChangeProposalsStatusMutation';

@ArgsType()
export class AssignProposalsToSepArgs {
  @Field(() => [ProposalPkWithCallId])
  public proposals: ProposalPkWithCallId[];

  @Field(() => Int)
  public sepId: number;
}

@ArgsType()
export class RemoveProposalsFromSepArgs {
  @Field(() => [Int])
  public proposalPks: number[];

  @Field(() => Int)
  public sepId: number;
}

@Resolver()
export class AssignProposalsToSEPMutation {
  @Mutation(() => Boolean)
  async assignProposalsToSep(
    @Args() args: AssignProposalsToSepArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.sep.assignProposalsToSep(context.user, args);
  }

  @Mutation(() => SEP)
  async removeProposalsFromSep(
    @Args() args: RemoveProposalsFromSepArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.sep.removeProposalsFromSep(context.user, args);
  }
}
