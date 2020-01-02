import { Arg, Ctx, Field, Mutation, ObjectType, Resolver } from "type-graphql";
import { ResolverContext } from "../../context";
import { ResponseWrapBase } from "../Wrappers";
import { wrapResponse } from "../wrapResponse";
import { Response } from "../Decorators";

@ObjectType()
class EmailVerificationResponseWrap extends ResponseWrapBase<boolean> {
  @Response()
  @Field({ nullable: true })
  public success: boolean;
}

@Resolver()
export class EmailVerificationMutation {
  @Mutation(() => EmailVerificationResponseWrap, { nullable: true })
  emailVerification(
    @Arg("token") token: string,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.user.emailVerification(token),
      EmailVerificationResponseWrap
    );
  }
}
