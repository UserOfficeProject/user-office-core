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

@ObjectType()
class AddUserForReviewResponseWrap extends AbstractResponseWrap<Review> {
  @Field(() => Review, { nullable: true })
  public review: Review;
  setValue(value: Review): void {
    this.review = value;
  }
}

@ArgsType()
class AddUserForReviewArgs {
  @Field(() => Int)
  public userID: number;

  @Field(() => Int)
  public proposalID: number;
}

const wrap = wrapResponse<Review>(new AddUserForReviewResponseWrap());

@Resolver()
export class AddUserForReviewMutation {
  @Mutation(() => AddUserForReviewResponseWrap, { nullable: true })
  addUserForReview(
    @Args() args: AddUserForReviewArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrap(
      context.mutations.review.addUserForReview(
        context.user,
        args.userID,
        args.proposalID
      )
    );
  }
}
