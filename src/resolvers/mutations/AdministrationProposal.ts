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
import { ProposalEndStatus, ProposalStatus } from '../../models/Proposal';
import { ProposalResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@ArgsType()
export class AdministrationProposalArgs {
  @Field(() => Int)
  public id: number;

  @Field(() => String, { nullable: true })
  public commentForUser?: string;

  @Field(() => String, { nullable: true })
  public commentForManagement?: string;

  @Field(() => ProposalEndStatus, { nullable: true })
  public finalStatus?: ProposalEndStatus;

  @Field(() => ProposalStatus, { nullable: true })
  public status?: ProposalStatus;

  @Field(() => Int, { nullable: true })
  public rankOrder?: number;
}

@Resolver()
export class AdministrationProposalMutation {
  @Mutation(() => ProposalResponseWrap)
  administrationProposal(
    @Args()
    args: AdministrationProposalArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.proposal.admin(context.user, args),
      ProposalResponseWrap
    );
  }
}
