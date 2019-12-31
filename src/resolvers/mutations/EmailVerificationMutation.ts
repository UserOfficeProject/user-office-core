import { Resolver, ObjectType, Ctx, Mutation, Field, Arg } from "type-graphql";
import { ResolverContext } from "../../context";
import { AbstractResponseWrap, wrapResponse } from "../Utils";

@ObjectType()
class EmailVerificationResponseWrap extends AbstractResponseWrap<boolean> {
  @Field({ nullable: true })
  public success: boolean;

  setValue(value: boolean): void {
    this.success = value;
  }
}

const wrap = wrapResponse<boolean>(new EmailVerificationResponseWrap());

@Resolver()
export class EmailVerificationMutation {
  @Mutation(() => EmailVerificationResponseWrap, { nullable: true })
  emailVerification(
    @Arg("token") token: string,
    @Ctx() context: ResolverContext
  ) {
    return wrap(context.mutations.user.emailVerification(token));
  }
}
