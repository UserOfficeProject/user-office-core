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
export class CreateInternalReviewInput implements Partial<InternalReviewModel> {
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
export class CreateInternalReviewMutation {
  @Mutation(() => InternalReview)
  createInternalReview(
    @Arg('createInternalReviewInput')
    createInternalReviewInput: CreateInternalReviewInput,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.internalReview.create(
      context.user,
      createInternalReviewInput
    );
  }
}
