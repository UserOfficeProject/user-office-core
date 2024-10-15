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
import { isRejection } from '../../models/Rejection';

@ArgsType()
export class AssignProposalsToInstrumentsArgs {
  @Field(() => [Int])
  public proposalPks: number[];

  @Field(() => [Int])
  public instrumentIds: number[];
}

@ArgsType()
export class RemoveProposalsFromInstrumentArgs {
  @Field(() => [Int])
  public proposalPks: number[];
}

@Resolver()
export class AssignProposalsToInstrumentsMutation {
  @Mutation(() => Boolean)
  async assignProposalsToInstruments(
    @Args() args: AssignProposalsToInstrumentsArgs,
    @Ctx() context: ResolverContext
  ) {
    const res = await context.mutations.instrument.assignProposalsToInstruments(
      context.user,
      args
    );

    const proposalsFaps = await context.queries.fap.getProposalsFaps(
      context.user,
      args.proposalPks
    );

    await context.mutations.fap.assignProposalsToFapUsingCallInstrument(
      context.user,
      {
        instrumentIds: args.instrumentIds,
        proposalPks: args.proposalPks.filter(
          (proposalPk) =>
            !proposalsFaps.find((ps) => ps.proposalPk === proposalPk)
        ),
      }
    );

    return isRejection(res) ? res : true;
  }

  @Mutation(() => Boolean)
  async removeProposalsFromInstrument(
    @Args() args: RemoveProposalsFromInstrumentArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.instrument.removeProposalsFromInstrument(
      context.user,
      args
    );
  }

  @Mutation(() => Boolean)
  async assignXpressProposalsToInstruments(
    @Args() args: AssignProposalsToInstrumentsArgs,
    @Ctx() context: ResolverContext
  ) {
    const isXpressProposals =
      await context.mutations.technique.checkProposalsHasTechniques(
        args.proposalPks
      );

    if (!isXpressProposals) {
      return false;
    }

    const res =
      await context.mutations.instrument.assignXpressProposalsToInstruments(
        context.user,
        args
      );

    return isRejection(res) ? res : true;
  }

  @Mutation(() => Boolean)
  async removeXpressProposalsFromInstrument(
    @Args() args: RemoveProposalsFromInstrumentArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.instrument.removeXpressProposalsFromInstrument(
      context.user,
      args
    );
  }
}
