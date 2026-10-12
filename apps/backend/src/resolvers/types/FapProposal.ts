import {
  ObjectType,
  Field,
  Int,
  Resolver,
  FieldResolver,
  Root,
  Ctx,
} from 'type-graphql';

import { FapAssignment } from './FapAssignments';
import { Instrument } from './Instrument';
import { Proposal } from './Proposal';
import { ResolverContext } from '../../context';

@ObjectType()
export class FapProposal {
  @Field(() => Int)
  public proposalPk: number;

  @Field(() => Int)
  public fapId: number;

  @Field(() => Date)
  public dateAssigned: Date;

  @Field(() => Int)
  public instrumentId: number | null;

  @Field(() => Int)
  public fapProposalId: number;
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
    return context.queries.fap.dataSource.isFapProposalInstrumentSubmittedById(
      fapProposal.fapProposalId
    );
  }

  @FieldResolver(() => Instrument, { nullable: true })
  async instrument(
    @Root() fapProposal: FapProposal,
    @Ctx() context: ResolverContext
  ) {
    return fapProposal.instrumentId
      ? context.queries.instrument.get(context.user, fapProposal.instrumentId)
      : null;
  }

  @FieldResolver(() => Int, { nullable: true })
  async fapTimeAllocation(
    @Root() fapProposal: FapProposal,
    @Ctx() context: ResolverContext
  ) {
    return context.queries.fap.getFapProposalTimeAllocation(
      context.user,
      fapProposal.fapProposalId
    );
  }

  @FieldResolver(() => Int, { nullable: true })
  async proposalTimeRequested(
    @Root() fapProposal: FapProposal,
    @Ctx() context: ResolverContext
  ) {
    return fapProposal.instrumentId
      ? context.queries.proposal.dataSource.getRequestedTime(
          fapProposal.proposalPk,
          fapProposal.instrumentId
        )
      : null;
  }
}
