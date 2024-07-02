import {
  ObjectType,
  Field,
  Int,
  Resolver,
  FieldResolver,
  Root,
  Ctx,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { FapAssignment } from './FapAssignments';
import { Proposal } from './Proposal';

@ObjectType()
export class FapProposal {
  @Field(() => Int)
  public proposalPk: number;

  @Field(() => Int)
  public fapId: number;

  @Field(() => Date)
  public dateAssigned: Date;

  @Field(() => Int, { nullable: true })
  public fapTimeAllocation?: number | null;

  @Field(() => Int)
  public instrumentId: number | null;
}

@Resolver(() => FapProposal)
export class FapProposalResolver {
  @FieldResolver(() => Proposal)
  async proposal(
    @Root() fapProposal: FapProposal,
    @Ctx() context: ResolverContext
  ) {
    return context.queries.proposal.dataSource.get(fapProposal.proposalPk);
  }

  @FieldResolver(() => [FapAssignment], { nullable: true })
  async assignments(
    @Root() fapProposal: FapProposal,
    @Ctx() context: ResolverContext
  ) {
    return context.queries.fap.getFapProposalAssignments(context.user, {
      fapId: fapProposal.fapId,
      proposalPk: fapProposal.proposalPk,
    });
  }

  @FieldResolver(() => Boolean)
  async instrumentSubmitted(
    @Root() fapProposal: FapProposal,
    @Ctx() context: ResolverContext
  ) {
    return context.queries.fap.dataSource.isFapProposalInstrumentSubmitted(
      fapProposal.proposalPk,
      fapProposal.instrumentId
    );
  }
}
