import { Arg, Ctx, Field, Mutation, ObjectType, Resolver } from "type-graphql";
import { ResolverContext } from "../../context";
import { Response } from "../Decorators";
import { ResponseWrapBase } from "../types/CommonWrappers";
import { wrapResponse } from "../wrapResponse";

@ObjectType()
class ResetPasswordEmailResponseWrap extends ResponseWrapBase<boolean> {
  @Response()
  @Field(() => Boolean, { nullable: true })
  public success: boolean;
}

@Resolver()
export class ResetPasswordEmailMutation {
  @Mutation(() => ResetPasswordEmailResponseWrap)
  resetPasswordEmail(
    @Arg("email") email: string,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.user.resetPasswordEmail(email),
      ResetPasswordEmailResponseWrap
    );
  }
}
