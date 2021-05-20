import {
  Resolver,
  ObjectType,
  Ctx,
  Mutation,
  Field,
  Int,
  ArgsType,
  Args,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { Response } from '../Decorators';
import { ResponseWrapBase } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@ArgsType()
export class AddUserRoleArgs {
  @Field(() => Int)
  public userID: number;

  @Field(() => Int)
  public roleID: number;
}

@ObjectType()
class AddUserRoleResponseWrap extends ResponseWrapBase {
  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  @Response()
  @Field({ nullable: true })
  public success: boolean = false;
}

@Resolver()
export class AddUserRoleMutation {
  @Mutation(() => AddUserRoleResponseWrap)
  addUserRole(@Args() args: AddUserRoleArgs, @Ctx() context: ResolverContext) {
    return wrapResponse(
      context.mutations.user.addUserRole(context.user, args),
      AddUserRoleResponseWrap
    );
  }
}
