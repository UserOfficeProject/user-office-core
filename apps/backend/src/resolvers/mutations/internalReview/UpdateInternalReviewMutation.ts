import {
  Arg,
  Ctx,
  Field,
  InputType,
  Int,
  Mutation,
  Resolver,
} from 'type-graphql';

import { ResolverContext } from '../../../context';
import { InternalReview as InternalReviewModel } from '../../../models/InternalReview';
import { InternalReview } from '../../types/InternalReview';

@InputType()
export class UpdateInternalReviewInput implements Partial<InternalReviewModel> {
  @Field(() => Int)
  public id: number;

  @Field(() => String)
  public title: string;

  @Field(() => String, { nullable: true })
  public comment: string | null;

  @Field(() => Int)
  public technicalReviewId: number;

  @Field(() => Int, { nullable: true })
  public reviewerId: number;

  @Field(() => String, { nullable: true })
  public files: string | null;
}

@Resolver()
export class UpdateInternalReviewMutation {
  @Mutation(() => InternalReview)
  updateInternalReview(
    @Arg('updateInternalReviewInput')
    updateInternalReviewInput: UpdateInternalReviewInput,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.internalReview.update(
      context.user,
      updateInternalReviewInput
    );
  }
}
