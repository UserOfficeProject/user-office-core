import { Args, ArgsType, Ctx, Field, Mutation, Resolver } from "type-graphql";
import { ResolverContext } from "../../context";
import { CallResponseWrap } from "../types/CommonWrappers";
import { wrapResponse } from "../wrapResponse";

@ArgsType()
class CreateCallArgs {
  @Field()
  public shortCode: string;

  @Field()
  public startCall: string;

  @Field()
  public endCall: string;

  @Field()
  public startReview: string;

  @Field()
  public endReview: string;

  @Field()
  public startNotify: string;

  @Field()
  public endNotify: string;

  @Field()
  public cycleComment: string;

  @Field()
  public surveyComment: string;
}

@Resolver()
export class CreateCallMutation {
  @Mutation(() => CallResponseWrap)
  createCall(@Args() args: CreateCallArgs, @Ctx() context: ResolverContext) {
    return wrapResponse(
      context.mutations.call.create(
        context.user,
        args.shortCode,
        args.startCall,
        args.endCall,
        args.startReview,
        args.endReview,
        args.startNotify,
        args.endNotify,
        args.cycleComment,
        args.surveyComment
      ),
      CallResponseWrap
    );
  }
}
