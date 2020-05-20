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
  public proposalId: number;

  @Field(() => Int)
  public sepId: number;

  @Field(() => Date)
  public dateAssigned: Date;
}

@Resolver(() => SEPProposal)
export class SEPUserResolver {
  @FieldResolver(() => Proposal)
  async proposal(
    @Root() sepProposal: SEPProposal,
    @Ctx() context: ResolverContext
  ) {
    return context.queries.proposal.dataSource.get(sepProposal.proposalId);
  }

  @FieldResolver(() => [SEPAssignment], { nullable: true })
  async assignments(
    @Root() sepProposal: SEPProposal,
    @Ctx() context: ResolverContext
  ) {
    return context.queries.sep.dataSource.getAssignments(
      sepProposal.sepId,
      sepProposal.proposalId
    );
  }
}
