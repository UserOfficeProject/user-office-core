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
import { isRejection, rejection } from '../../models/Rejection';

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
    const techniquesWithProposal =
      await context.queries.technique.getTechniquesByProposalPk(
        context.user,
        args.proposalPks[0]
      );

    if (!techniquesWithProposal || techniquesWithProposal.length < 1) {
      return rejection(
        'Failed to retrieve techniques attached to the proposal'
      );
    }

    const instrumentWithTechnique =
      await context.queries.technique.getInstrumentsByTechniqueId(
        context.user,
        techniquesWithProposal[0].id
      );

    let isXpress = false;

    if (!isRejection(instrumentWithTechnique)) {
      isXpress =
        instrumentWithTechnique.length > 0 &&
        instrumentWithTechnique.filter(
          (instruments) => instruments.id === args.instrumentIds[0]
        ).length > 0;
    } else {
      return instrumentWithTechnique;
    }

    if (!isXpress) {
      return rejection('No permission to assign instrument for this proposal');
    }

    const res =
      await context.mutations.instrument.assignXpressProposalsToInstruments(
        context.user,
        args
      );

    return isRejection(res) ? res : true;
  }
}
