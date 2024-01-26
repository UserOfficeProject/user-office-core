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
import { ProposalSelectionInput } from './ChangeProposalsStatusMutation';

@ArgsType()
export class AssignProposalsToInstrumentArgs {
  @Field(() => [ProposalSelectionInput])
  public proposals: ProposalSelectionInput[];

  @Field(() => [Int])
  public instrumentIds: number[];
}

@ArgsType()
export class RemoveProposalsFromInstrumentArgs {
  @Field(() => [Int])
  public proposalPks: number[];
}

@Resolver()
export class AssignProposalsToInstrumentMutation {
  @Mutation(() => Boolean)
  async assignProposalsToInstrument(
    @Args() args: AssignProposalsToInstrumentArgs,
    @Ctx() context: ResolverContext
  ) {
    const res = await context.mutations.instrument.assignProposalsToInstrument(
      context.user,
      args
    );

    // TODO: Review this when starting with FAP part for multi instrument. For now only the first instrument FAP is assigned just to be backwards compatible.
    const proposalsFaps = await context.queries.fap.getProposalsFaps(
      context.user,
      args.proposals.map((proposal) => proposal.primaryKey)
    );

    await context.mutations.fap.assignProposalsToFapUsingCallInstrument(
      context.user,
      {
        instrumentId: args.instrumentIds[0],
        proposalPks: args.proposals
          .filter(
            (proposal) =>
              !proposalsFaps.find((ps) => ps.proposalPk === proposal.primaryKey)
          )
          .map((proposal) => proposal.primaryKey),
      }
    );
    // ----------------------

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
}
