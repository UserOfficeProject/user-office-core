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
import { AbstractResponseWrap, wrapResponse } from "../Utils";

@ArgsType()
class AddUserRoleArgs {
  @Field(() => Int)
  public userID: number;

  @Field(() => Int)
  public roleID: number;
}

@ObjectType()
class AddUserRoleResponseWrap extends AbstractResponseWrap<boolean> {
  @Field({ nullable: true })
  public success: boolean = false;
  setValue(value: boolean): void {
    this.success = value;
  }
}

const wrap = wrapResponse<boolean>(new AddUserRoleResponseWrap());

@Resolver()
export class AddUserRoleMutation {
  @Mutation(() => AddUserRoleResponseWrap, { nullable: true })
  addUserRole(@Args() args: AddUserRoleArgs, @Ctx() context: ResolverContext) {
    return wrap(
      context.mutations.user.addUserRole(context.user, args.userID, args.roleID)
    );
  }
}
