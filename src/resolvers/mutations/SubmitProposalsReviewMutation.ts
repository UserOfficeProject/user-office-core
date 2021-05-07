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
import { isRejection, rejection } from '../../rejection';
import { SuccessResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@InputType()
export class ProposalIdWithReviewId {
  @Field(() => Int)
  public proposalId: number;

  @Field(() => Int)
  public reviewId: number;
}

@InputType()
export class SubmitProposalsReviewInput {
  @Field(() => [ProposalIdWithReviewId])
  public proposals: ProposalIdWithReviewId[];
}

@Resolver()
export class SubmitProposalsReviewMutation {
  @Mutation(() => SuccessResponseWrap)
  async submitProposalsReview(
    @Arg('submitProposalsReviewInput')
    submitProposalsReviewInput: SubmitProposalsReviewInput,
    @Ctx() context: ResolverContext
  ) {
    const results = await Promise.all(
      submitProposalsReviewInput.proposals.map((proposal) => {
        return context.mutations.review.submitProposalReview(
          context.user,
          proposal
        );
      })
    );

    return wrapResponse(
      results.some((result) => isRejection(result))
        ? Promise.resolve(rejection('REJECTED'))
        : Promise.resolve(true),
      SuccessResponseWrap
    );
  }
}
