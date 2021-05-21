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
export class AddTechnicalReviewInput implements Partial<TechnicalReview> {
  @Field(() => Int)
  public proposalID: number;

  @Field(() => String, { nullable: true })
  public comment: string;

  @Field(() => String, { nullable: true })
  public publicComment: string;

  @Field(() => Int, { nullable: true })
  public timeAllocation: number;

  @Field(() => TechnicalReviewStatus, { nullable: true })
  public status: TechnicalReviewStatus;

  @Field(() => Boolean, { nullable: true })
  public submitted: boolean;

  @Field(() => Int, { nullable: true })
  public reviewerId: number;
}

@Resolver()
export class AddTechnicalReviewMutation {
  @Mutation(() => TechnicalReviewResponseWrap)
  addTechnicalReview(
    @Arg('addTechnicalReviewInput')
    addTechnicalReviewInput: AddTechnicalReviewInput,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.review.setTechnicalReview(
        context.user,
        addTechnicalReviewInput
      ),
      TechnicalReviewResponseWrap
    );
  }
}
