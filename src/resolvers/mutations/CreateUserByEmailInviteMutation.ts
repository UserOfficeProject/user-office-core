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
import { AbstractResponseWrap, wrapResponse } from "../Utils";

@ArgsType()
class CreateUserByEmailInviteArgs {
  @Field()
  public firstname: string;

  @Field()
  public lastname: string;

  @Field()
  public email: string;
}

@ObjectType()
class CreateUserByEmailInviteResponseWrap extends AbstractResponseWrap<{
  userId: number;
  inviterId: number;
}> {
  @Field(() => Int, { nullable: true })
  public id: number;
  setValue(value: { userId: number; inviterId: number }): void {
    this.id = value.userId;
  }
}

const wrap = wrapResponse<{ userId: number; inviterId: number }>(
  new CreateUserByEmailInviteResponseWrap()
);

@Resolver()
export class CreateUserByEmailInviteMutation {
  @Mutation(() => CreateUserByEmailInviteResponseWrap, { nullable: true })
  createUserByEmailInvite(
    @Args() args: CreateUserByEmailInviteArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrap(
      context.mutations.user.createUserByEmailInvite(
        context.user,
        args.firstname,
        args.lastname,
        args.email
      )
    );
  }
}
