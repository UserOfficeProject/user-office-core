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
import { ResponseWrapBase } from "../Wrappers";
import { wrapResponse } from "../wrapResponse";
import { Response } from "../Decorators";

@ArgsType()
class AddUserRoleArgs {
  @Field(() => Int)
  public userID: number;

  @Field(() => Int)
  public roleID: number;
}

@ObjectType()
class AddUserRoleResponseWrap extends ResponseWrapBase<boolean> {
  @Response()
  @Field({ nullable: true })
  public success: boolean = false;
}

@Resolver()
export class AddUserRoleMutation {
  @Mutation(() => AddUserRoleResponseWrap, { nullable: true })
  addUserRole(@Args() args: AddUserRoleArgs, @Ctx() context: ResolverContext) {
    return wrapResponse(
      context.mutations.user.addUserRole(
        context.user,
        args.userID,
        args.roleID
      ),
      AddUserRoleResponseWrap
    );
  }
}
