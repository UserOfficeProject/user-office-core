import { Arg, Ctx, Field, Mutation, ObjectType, Resolver } from "type-graphql";
import { ResolverContext } from "../../context";
import { isRejection } from "../../rejection";
import { AbstractResponseWrap, wrapResponse } from "../Utils";

@ObjectType()
class ResetPasswordEmailResponseWrap extends AbstractResponseWrap<any> {
  @Field(() => Boolean, { nullable: true })
  public success: boolean;

  setValue(value: any): void {
    this.success = isRejection(value);
  }
}

const wrap = wrapResponse<any>(new ResetPasswordEmailResponseWrap());

@Resolver()
export class ResetPasswordEmailMutation {
  @Mutation(() => ResetPasswordEmailResponseWrap, { nullable: true })
  resetPasswordEmail(
    @Arg("email") email: string,
    @Ctx() context: ResolverContext
  ) {
    return wrap(context.mutations.user.resetPasswordEmail(email));
  }
}
