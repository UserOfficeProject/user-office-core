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
import { Response } from "../Decorators";
import { ResponseWrapBase } from "../types/CommonWrappers";
import { wrapResponse } from "../wrapResponse";

@ArgsType()
export class CreateUserByEmailInviteArgs {
  @Field()
  public firstname: string;

  @Field()
  public lastname: string;

  @Field()
  public email: string;
}

@ObjectType()
class CreateUserByEmailInviteResponseWrap extends ResponseWrapBase<{
  userId: number;
  inviterId: number;
}> {
  @Response()
  @Field(() => Int, { nullable: true })
  public id: number;
}

@Resolver()
export class CreateUserByEmailInviteMutation {
  @Mutation(() => CreateUserByEmailInviteResponseWrap)
  createUserByEmailInvite(
    @Args() args: CreateUserByEmailInviteArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.user.createUserByEmailInvite(context.user, args),
      CreateUserByEmailInviteResponseWrap
    );
  }
}
