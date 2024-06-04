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
export class ChangeProposalsStatusInput {
  @Field(() => Int)
  public statusId: number;

  @Field(() => [Int])
  public proposalPks: number[];
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
