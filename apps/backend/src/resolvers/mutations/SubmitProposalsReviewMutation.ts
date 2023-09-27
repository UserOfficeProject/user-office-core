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
import { isRejection, rejection } from '../../models/Rejection';

@InputType()
export class ProposalPkWithReviewId {
  @Field(() => Int)
  public proposalPk: number;

  @Field(() => Int)
  public reviewId: number;
}

@InputType()
export class SubmitProposalsReviewInput {
  @Field(() => [ProposalPkWithReviewId])
  public proposals: ProposalPkWithReviewId[];
}

@Resolver()
export class SubmitProposalsReviewMutation {
  @Mutation(() => Boolean)
  async submitProposalsReview(
    @Arg('submitProposalsReviewInput')
    submitProposalsReviewInput: SubmitProposalsReviewInput,
    @Ctx() context: ResolverContext
  ) {
    const failedProposals = [];
    for await (const proposal of submitProposalsReviewInput.proposals) {
      const submitResult = await context.mutations.review.submitProposalReview(
        context.user,
        proposal
      );
      if (isRejection(submitResult)) {
        failedProposals.push(proposal);
      }
    }

    if (failedProposals.length > 0) {
      throw rejection('Failed to submit one more proposal reviews');
    } else {
      return true;
    }
  }
}
