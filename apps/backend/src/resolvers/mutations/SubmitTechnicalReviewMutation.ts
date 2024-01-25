import {
  Arg,
  Ctx,
  Field,
  InputType,
  Int,
  Mutation,
  Resolver,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { isRejection, rejection } from '../../models/Rejection';
import { TechnicalReviewStatus } from '../../models/TechnicalReview';
import { TechnicalReview } from '../types/TechnicalReview';

@InputType()
export class SubmitTechnicalReviewInput implements Partial<TechnicalReview> {
  @Field(() => Int)
  public proposalPk: number;

  @Field(() => String, { nullable: true })
  public comment: string;

  @Field(() => String, { nullable: true })
  public publicComment: string;

  @Field(() => Int, { nullable: true })
  public timeAllocation: number;

  @Field(() => TechnicalReviewStatus, { nullable: true })
  public status: TechnicalReviewStatus;

  @Field(() => Boolean)
  public submitted: boolean;

  @Field(() => Int)
  public reviewerId: number;

  @Field(() => String, { nullable: true })
  public files: string;

  @Field(() => Int)
  public instrumentId: number;
}

@InputType()
export class SubmitTechnicalReviewsInput {
  @Field(() => [SubmitTechnicalReviewInput])
  public technicalReviews: SubmitTechnicalReviewInput[];
}

@Resolver()
export class SubmitTechnicalReviewMutation {
  @Mutation(() => Boolean)
  async submitTechnicalReviews(
    @Arg('submitTechnicalReviewsInput')
    submitTechnicalReviewsInput: SubmitTechnicalReviewsInput,
    @Ctx() context: ResolverContext
  ) {
    const failedReviews = [];
    for await (const technicalReview of submitTechnicalReviewsInput.technicalReviews) {
      const submitResult = await context.mutations.review.submitTechnicalReview(
        context.user,
        technicalReview
      );
      if (isRejection(submitResult)) {
        failedReviews.push(technicalReview);
      }
    }

    if (failedReviews.length > 0) {
      throw rejection('Failed to submit one or more technical reviews');
    } else {
      return true;
    }
  }
}
