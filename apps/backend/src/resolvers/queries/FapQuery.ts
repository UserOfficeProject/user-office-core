import { Query, Ctx, Resolver, Arg, Int } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Fap } from '../types/Fap';
import { FapProposal } from '../types/FapProposal';
import { FapReviewer } from '../types/FapReviewers';

@Resolver()
export class FapQuery {
  @Query(() => Fap, { nullable: true })
  async fap(
    @Arg('id', () => Int) id: number,
    @Ctx() context: ResolverContext
  ): Promise<Fap | null> {
    console.log('FAP basic info query');

    return context.queries.fap.get(context.user, id);
  }

  @Query(() => [FapReviewer], { nullable: true })
  async fapMembers(
    @Arg('fapId', () => Int) fapId: number,
    @Ctx() context: ResolverContext
  ): Promise<FapReviewer[] | null> {
    return context.queries.fap.getMembers(context.user, fapId);
  }

  @Query(() => [FapReviewer], { nullable: true })
  async fapReviewers(
    @Arg('fapId', () => Int) fapId: number,
    @Ctx() context: ResolverContext
  ): Promise<FapReviewer[] | null> {
    return context.queries.fap.getReviewers(context.user, fapId);
  }

  @Query(() => [FapProposal], { nullable: true })
  async fapProposals(
    @Arg('fapId', () => Int) fapId: number,
    @Arg('callId', () => Int, { nullable: true }) callId: number | null,
    @Arg('first', () => Int, { nullable: true }) first: number | null,
    @Arg('offset', () => Int, { nullable: true }) offset: number | null,
    @Ctx() context: ResolverContext
  ): Promise<FapProposal[] | null> {
    return context.queries.fap.getFapProposals(context.user, {
      fapId,
      callId,
      first,
      offset,
    });
  }

  @Query(() => FapProposal, { nullable: true })
  async fapProposal(
    @Arg('fapId', () => Int) fapId: number,
    @Arg('proposalPk', () => Int) proposalPk: number,
    @Ctx() context: ResolverContext
  ): Promise<FapProposal | null> {
    return context.queries.fap.getFapProposal(context.user, {
      fapId,
      proposalPk,
    });
  }

  @Query(() => [FapProposal], { nullable: true })
  async fapProposalsByInstrument(
    @Arg('fapId', () => Int) fapId: number,
    @Arg('instrumentId', () => Int) instrumentId: number,
    @Arg('callId', () => Int) callId: number,
    @Ctx() context: ResolverContext
  ): Promise<FapProposal[] | null> {
    return context.queries.fap.getFapProposalsByInstrument(context.user, {
      instrumentId,
      callId,
      fapId,
    });
  }
}
