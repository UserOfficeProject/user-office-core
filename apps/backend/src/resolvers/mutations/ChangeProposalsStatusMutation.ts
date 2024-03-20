import {
  Ctx,
  Mutation,
  Resolver,
  Arg,
  Int,
  Field,
  InputType,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { isRejection } from '../../models/Rejection';

@InputType()
export class ProposalSelectionInput {
  @Field(() => Int)
  public primaryKey: number;

  @Field(() => Int)
  public callId: number;

  @Field(() => Int, { nullable: true })
  public workflowId?: number;
}

@InputType()
export class ChangeProposalsStatusInput {
  @Field(() => Int)
  public statusId: number;

  // TODO: It is better to collect the data here on the backend then sending callId and workflowId as arguments.
  @Field(() => [ProposalSelectionInput])
  public proposals: ProposalSelectionInput[];
}

@Resolver()
export class ChangeProposalsStatusMutation {
  @Mutation(() => Boolean)
  async changeProposalsStatus(
    @Arg('changeProposalsStatusInput')
    changeProposalsStatusInput: ChangeProposalsStatusInput,
    @Ctx() context: ResolverContext
  ) {
    const result = await context.mutations.proposal.changeProposalsStatus(
      context.user,
      changeProposalsStatusInput
    );

    return isRejection(result) ? result : true;
  }
}
