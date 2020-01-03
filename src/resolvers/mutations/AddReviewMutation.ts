import {
  Args,
  ArgsType,
  Ctx,
  Field,
  Int,
  Mutation,
  Resolver
} from "type-graphql";
import { ResolverContext } from "../../context";
import { Review } from "../../models/Review";
import { ReviewResponseWrap } from "../types/CommonWrappers";
import { wrapResponse } from "../wrapResponse";

@ArgsType()
class AddReviewArgs {
  @Field(() => Int)
  public reviewID: number;

  @Field()
  public comment: string;

  @Field(() => Int)
  public grade: number;
}

@Resolver()
export class AddReviewMutation {
  @Mutation(() => ReviewResponseWrap, { nullable: true })
  addReview(@Args() args: AddReviewArgs, @Ctx() context: ResolverContext) {
    return wrapResponse<Review>(
      context.mutations.review.submitReview(
        context.user,
        args.reviewID,
        args.comment,
        args.grade
      ),
      ReviewResponseWrap
    );
  }
}
