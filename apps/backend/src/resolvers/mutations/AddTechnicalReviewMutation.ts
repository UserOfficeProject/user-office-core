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
import { TechnicalReview } from '../types/TechnicalReview';
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

  @Field(() => Int)
  public instrumentId: number;
}

@Resolver()
export class AddTechnicalReviewMutation {
  @Mutation(() => TechnicalReview)
  addTechnicalReview(
    @Arg('addTechnicalReviewInput')
    addTechnicalReviewInput: AddTechnicalReviewInput,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.review.setTechnicalReview(
      context.user,
      addTechnicalReviewInput
    );
  }
}
