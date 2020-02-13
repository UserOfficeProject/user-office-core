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

import { ReviewResponseWrap } from "../types/CommonWrappers";
import { wrapResponse } from "../wrapResponse";
import { Review } from "../types/Review";

@ArgsType()
export class AddReviewArgs {
  @Field(() => Int)
  public reviewID: number;

  @Field()
  public comment: string;

  @Field(() => Int)
  public grade: number;
}

@Resolver()
export class AddReviewMutation {
  @Mutation(() => ReviewResponseWrap)
  addReview(@Args() args: AddReviewArgs, @Ctx() context: ResolverContext) {
    return wrapResponse<Review>(
      context.mutations.review.submitReview(context.user, args),
      ReviewResponseWrap
    );
  }
}
