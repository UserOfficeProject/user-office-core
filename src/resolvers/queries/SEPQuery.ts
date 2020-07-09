import { Query, Ctx, Resolver, Arg, Int } from 'type-graphql';

import { ResolverContext } from '../../context';
import { SEP } from '../types/SEP';
import { SEPMember } from '../types/SEPMembers';
import { SEPProposal } from '../types/SEPProposal';

@Resolver()
export class SEPQuery {
  @Query(() => SEP, { nullable: true })
  async sep(
    @Arg('id', () => Int) id: number,
    @Ctx() context: ResolverContext
  ): Promise<SEP | null> {
    return context.queries.sep.get(context.user, id);
  }

  @Query(() => [SEPMember], { nullable: true })
  async sepMembers(
    @Arg('sepId', () => Int) sepId: number,
    @Ctx() context: ResolverContext
  ): Promise<SEPMember[] | null> {
    return context.queries.sep.getMembers(context.user, sepId);
  }

  @Query(() => [SEPProposal], { nullable: true })
  async sepProposals(
    @Arg('sepId', () => Int) sepId: number,
    @Ctx() context: ResolverContext
  ): Promise<SEPProposal[] | null> {
    return context.queries.sep.getSEPProposals(context.user, sepId);
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
