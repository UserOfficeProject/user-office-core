import {
  Resolver,
  ObjectType,
  Ctx,
  Mutation,
  Field,
  Int,
  ArgsType,
  Args
} from "type-graphql";
import { ResolverContext } from "../../context";
import { Review } from "../../models/Review";
import { AbstractResponseWrap, wrapResponse } from "../Utils";

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
class AddReviewResponseWrap extends AbstractResponseWrap<Review> {
  @Field(() => Review, { nullable: true })
  public review: Review;

  setValue(value: Review): void {
    this.review = value;
  }
}

const wrap = wrapResponse<Review>(new AddReviewResponseWrap());

@Resolver()
export class AddReviewMutation {
  @Mutation(() => AddReviewResponseWrap, { nullable: true })
  addReview(@Args() args: AddReviewArgs, @Ctx() context: ResolverContext) {
    return wrap(
      context.mutations.review.submitReview(
        context.user,
        args.reviewID,
        args.comment,
        args.grade
      )
    );
  }
}
