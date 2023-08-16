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
export class DeleteInternalReviewInput implements Partial<InternalReviewModel> {
  @Field(() => Int)
  public id: number;

  @Field(() => Int)
  public technicalReviewId: number;
}

@Resolver()
export class DeleteInternalReviewMutation {
  @Mutation(() => InternalReview)
  deleteInternalReview(
    @Arg('deleteInternalReviewInput')
    deleteInternalReviewInput: DeleteInternalReviewInput,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.internalReview.delete(
      context.user,
      deleteInternalReviewInput
    );
  }
}
