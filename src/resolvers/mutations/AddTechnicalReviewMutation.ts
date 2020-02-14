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
import { TechnicalReviewResponseWrap } from "../types/CommonWrappers";
import { TechnicalReview } from "../types/TechnicalReview";
import { wrapResponse } from "../wrapResponse";
import { TechnicalReviewStatus } from "../../models/TechnicalReview";
@ArgsType()
export class AddTechnicalReviewArgs {
  @Field(() => Int)
  public proposalID: number;

  @Field(() => String)
  public comment: string;

  @Field(() => Int)
  public timeAllocation: number;

  @Field(() => TechnicalReviewStatus)
  public status: TechnicalReviewStatus;
}

@Resolver()
export class AddTechnicalReviewMutation {
  @Mutation(() => TechnicalReviewResponseWrap)
  addTechnicalReview(
    @Args() args: AddTechnicalReviewArgs,
    @Ctx() context: ResolverContext
  ) {
    console.log(args.status);
    return wrapResponse<TechnicalReview>(
      context.mutations.review.setTechnicalReview(context.user, args),
      TechnicalReviewResponseWrap
    );
  }
}
