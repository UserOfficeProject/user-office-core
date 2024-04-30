import { Query, Ctx, Resolver, Arg, Int } from 'type-graphql';

import { ResolverContext } from '../../context';
import { SEP } from '../types/SEP';
import { SEPProposal } from '../types/SEPProposal';
import { SEPReviewer } from '../types/SEPReviwers';

@Resolver()
export class SEPQuery {
  @Query(() => SEP, { nullable: true })
  async sep(
    @Arg('id', () => Int) id: number,
    @Ctx() context: ResolverContext
  ): Promise<SEP | null> {
    return context.queries.sep.get(context.user, id);
  }

  @Query(() => [SEPReviewer], { nullable: true })
  async sepMembers(
    @Arg('sepId', () => Int) sepId: number,
    @Ctx() context: ResolverContext
  ): Promise<SEPReviewer[] | null> {
    return context.queries.sep.getMembers(context.user, sepId);
  }

  @Query(() => [SEPReviewer], { nullable: true })
  async sepReviewers(
    @Arg('sepId', () => Int) sepId: number,
    @Ctx() context: ResolverContext
  ): Promise<SEPReviewer[] | null> {
    return context.queries.sep.getReviewers(context.user, sepId);
  }

  @Query(() => [SEPProposal], { nullable: true })
  async sepProposals(
    @Arg('sepId', () => Int) sepId: number,
    @Arg('callId', () => Int, { nullable: true }) callId: number | null,
    @Ctx() context: ResolverContext
  ): Promise<SEPProposal[] | null> {
    return context.queries.sep.getSEPProposals(context.user, { sepId, callId });
  }

  @Query(() => SEPProposal, { nullable: true })
  async sepProposal(
    @Arg('sepId', () => Int) sepId: number,
    @Arg('proposalPk', () => Int) proposalPk: number,
    @Ctx() context: ResolverContext
  ): Promise<SEPProposal | null> {
    return context.queries.sep.getSEPProposal(context.user, {
      sepId,
      proposalPk,
    });
  }

  @Query(() => [SEPProposal], { nullable: true })
  async sepProposalsByInstrument(
    @Arg('sepId', () => Int) sepId: number,
    @Arg('instrumentId', () => Int) instrumentId: number,
    @Arg('callId', () => Int) callId: number,
    @Ctx() context: ResolverContext
  ): Promise<SEPProposal[] | null> {
    return context.queries.sep.getSEPProposalsByInstrument(context.user, {
      sepId,
      instrumentId,
      callId,
    });
  }
}
