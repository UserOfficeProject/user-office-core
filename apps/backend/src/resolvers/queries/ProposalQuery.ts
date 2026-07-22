import { container } from 'tsyringe';
import { Query, Ctx, Resolver, Arg, Int } from 'type-graphql';

import { Tokens } from '../../config/Tokens';
import { ResolverContext } from '../../context';
import { ProposalDataSource } from '../../datasources/ProposalDataSource';
import { Proposal } from '../types/Proposal';

@Resolver()
export class ProposalQuery {
  @Query(() => Proposal, { nullable: true })
  async proposal(
    @Arg('primaryKey', () => Int) primaryKey: number,
    @Ctx() context: ResolverContext
  ): Promise<Proposal | null> {
    return context.queries.proposal.get(context.user, primaryKey);
  }

  @Query(() => Boolean, { nullable: true })
  async userHasAccessToProposal(
    @Arg('proposalPk', () => Int) proposalPk: number,
    @Ctx() context: ResolverContext
  ): Promise<boolean> {
    return context.queries.proposal.get(context.user, proposalPk) !== null;
  }

  @Query(() => Number, { nullable: false })
  async proposalTimeRequested(
    @Arg('proposalPk', () => Int) proposalPk: number,
    @Arg('instrumentId', () => Int) instrumentId: number,
    @Ctx() context: ResolverContext
  ): Promise<number> {
    const proposalDataSource = container.resolve<ProposalDataSource>(
      Tokens.ProposalDataSource
    );
    const timeRequested = await proposalDataSource.getRequestedTime(
      proposalPk,
      instrumentId
    );

    return timeRequested || 0;
  }
}
