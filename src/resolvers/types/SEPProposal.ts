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
import { Proposal } from './Proposal';
import { SEPAssignment } from './SEPAssignments';

@ObjectType()
export class SEPProposal {
  @Field(() => Int)
  public proposalPk: number;

  @Field(() => Int)
  public sepId: number;

  @Field(() => Date)
  public dateAssigned: Date;

  @Field(() => Int, { nullable: true })
  public sepTimeAllocation?: number | null;
}

@Resolver(() => SEPProposal)
export class SEPUserResolver {
  @FieldResolver(() => Proposal)
  async proposal(
    @Root() sepProposal: SEPProposal,
    @Ctx() context: ResolverContext
  ) {
    return context.queries.proposal.dataSource.get(sepProposal.proposalPk);
  }

  @FieldResolver(() => [SEPAssignment], { nullable: true })
  async assignments(
    @Root() sepProposal: SEPProposal,
    @Ctx() context: ResolverContext
  ) {
    return context.queries.sep.getSEPProposalAssignments(context.user, {
      sepId: sepProposal.sepId,
      proposalPk: sepProposal.proposalPk,
    });
  }

  @FieldResolver(() => Boolean)
  async instrumentSubmitted(
    @Root() sepProposal: SEPProposal,
    @Ctx() context: ResolverContext
  ) {
    return context.queries.instrument.dataSource.isProposalInstrumentSubmitted(
      sepProposal.proposalPk
    );
  }
}
