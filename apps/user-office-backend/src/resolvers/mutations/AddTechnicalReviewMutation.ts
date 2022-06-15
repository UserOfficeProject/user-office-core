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
  public proposalPk: number;

  @Field(() => String, { nullable: true })
  public comment: string | null;

  @Field(() => String, { nullable: true })
  public publicComment: string | null;

  @Field(() => Int, { nullable: true })
  public timeAllocation: number | null;

  @Field(() => TechnicalReviewStatus, { nullable: true })
  public status: TechnicalReviewStatus | null;

  @Field(() => Boolean, { nullable: true })
  public submitted: boolean;

  @Field(() => Int, { nullable: true })
  public reviewerId: number;

  @Field(() => String, { nullable: true })
  public files: string | null;
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
