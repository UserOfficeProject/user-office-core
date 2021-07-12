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
import { SuccessResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

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
