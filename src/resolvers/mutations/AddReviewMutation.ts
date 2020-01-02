import {
  Args,
  ArgsType,
  Ctx,
  Field,
  Int,
  Mutation,
  ObjectType,
  Resolver
} from "type-graphql";
import { ResolverContext } from "../../context";
import { Review } from "../../models/Review";
import { Response } from "../Decorators";
import { ResponseWrapBase } from "../Wrappers";
import { wrapResponse } from "../wrapResponse";

@ArgsType()
class AddReviewArgs {
  @Field(type => Int)
  public reviewID: number;

  @Field()
  public comment: string;

  @Field(type => Int)
  public grade: number;
}

@ObjectType()
class AddReviewResponseWrap extends ResponseWrapBase {
  @Response()
  @Field(() => Review, { nullable: true })
  public review: Review;
}

@Resolver()
export class AddReviewMutation {
  @Mutation(() => AddReviewResponseWrap, { nullable: true })
  addReview(@Args() args: AddReviewArgs, @Ctx() context: ResolverContext) {
    return wrapResponse<Review>(
      context.mutations.review.submitReview(
        context.user,
        args.reviewID,
        args.comment,
        args.grade
      ),
      AddReviewResponseWrap
    );
  }
}
