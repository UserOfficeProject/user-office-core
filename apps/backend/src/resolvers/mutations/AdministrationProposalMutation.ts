import {
  Args,
  ArgsType,
  Ctx,
  Field,
  InputType,
  Int,
  Mutation,
  Resolver,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { ProposalEndStatus } from '../../models/Proposal';
import { Proposal } from '../types/Proposal';

@InputType()
export class ManagementTimeAllocationsInput {
  @Field(() => Int)
  public instrumentId: number;

  @Field(() => Int)
  public value: number;
}

@ArgsType()
export class AdministrationProposalArgs {
  @Field(() => Int)
  public proposalPk: number;

  @Field(() => String, { nullable: true })
  public commentForUser?: string;

  @Field(() => String, { nullable: true })
  public commentForManagement?: string;

  @Field(() => ProposalEndStatus)
  public finalStatus: ProposalEndStatus;

  @Field(() => [ManagementTimeAllocationsInput])
  public managementTimeAllocations: ManagementTimeAllocationsInput[];

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
