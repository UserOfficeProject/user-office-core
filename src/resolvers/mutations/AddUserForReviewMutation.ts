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
import { ReviewResponseWrap } from "../Wrappers";
import { wrapResponse } from "../wrapResponse";

@ArgsType()
class AddUserForReviewArgs {
  @Field(() => Int)
  public userID: number;

  @Field(() => Int)
  public proposalID: number;
}

@Resolver()
export class AddUserForReviewMutation {
  @Mutation(() => ReviewResponseWrap, { nullable: true })
  addUserForReview(
    @Args() args: AddUserForReviewArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.review.addUserForReview(
        context.user,
        args.userID,
        args.proposalID
      ),
      ReviewResponseWrap
    );
  }
}
