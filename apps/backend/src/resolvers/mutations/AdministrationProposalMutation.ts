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
import { ProposalEndStatus } from '../../models/Proposal';
import { Proposal } from '../types/Proposal';

@ArgsType()
export class AdministrationProposalArgs {
  @Field(() => Int)
  public proposalPk: number;

  @Field(() => String, { nullable: true })
  public commentForUser?: string;

  @Field(() => String, { nullable: true })
  public commentForManagement?: string;

  @Field(() => ProposalEndStatus, { nullable: true })
  public finalStatus?: ProposalEndStatus;

  @Field(() => Int, { nullable: true })
  public statusId?: number;

  @Field(() => Int, { nullable: true })
  public managementTimeAllocation?: number;

  @Field(() => Boolean, { nullable: true })
  public managementDecisionSubmitted?: boolean;
}

@Resolver()
export class AdministrationProposalMutation {
  @Mutation(() => Proposal)
  administrationProposal(
    @Args()
    args: AdministrationProposalArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.proposal.admin(context.user, args);
  }
}
