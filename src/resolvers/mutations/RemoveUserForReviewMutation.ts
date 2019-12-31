import {
  Resolver,
  ObjectType,
  Ctx,
  Mutation,
  Field,
  Int,
  Arg
} from "type-graphql";
import { ResolverContext } from "../../context";
import { AbstractResponseWrap, wrapResponse } from "../Utils";
import { Review } from "../../models/Review";

@ObjectType()
class RemoveUserForReviewResponseWrap extends AbstractResponseWrap<Review> {
  @Field({ nullable: true })
  public review: Review;

  setValue(value: Review): void {
    this.review = value;
  }
}

const wrap = wrapResponse<Review>(new RemoveUserForReviewResponseWrap());

@Resolver()
export class RemoveUserForReviewMutation {
  @Mutation(() => RemoveUserForReviewResponseWrap, { nullable: true })
  removeUserForReview(
    @Arg("reviewID", () => Int) reviewID: number,
    @Ctx() context: ResolverContext
  ) {
    return wrap(
      context.mutations.review.removeUserForReview(context.user, reviewID)
    );
  }
}
