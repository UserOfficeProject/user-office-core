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
import { TechnicalReviewStatus } from '../../models/TechnicalReview';
import { TechnicalReviewResponseWrap } from '../types/CommonWrappers';
import { TechnicalReview } from '../types/TechnicalReview';
import { wrapResponse } from '../wrapResponse';

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
}

@Resolver()
export class SubmitTechnicalReviewMutation {
  @Mutation(() => TechnicalReviewResponseWrap)
  submitTechnicalReview(
    @Arg('submitTechnicalReviewInput')
    submitTechnicalReviewInput: SubmitTechnicalReviewInput,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.review.setTechnicalReview(
        context.user,
        submitTechnicalReviewInput
      ),
      TechnicalReviewResponseWrap
    );
  }
}
