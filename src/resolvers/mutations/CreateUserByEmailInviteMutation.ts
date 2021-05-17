import {
  Args,
  ArgsType,
  Ctx,
  Field,
  Int,
  Mutation,
  ObjectType,
  Resolver,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { isRejection } from '../../models/Rejection';
import { UserRole } from '../../models/User';
import { Response } from '../Decorators';
import { ResponseWrapBase } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@ArgsType()
export class CreateUserByEmailInviteArgs {
  @Field()
  public firstname: string;

  @Field()
  public lastname: string;

  @Field()
  public email: string;

  @Field(() => UserRole)
  userRole: UserRole;
}

@ObjectType()
class CreateUserByEmailInviteResponseWrap extends ResponseWrapBase {
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
      context.mutations.user
        .createUserByEmailInvite(context.user, args)
        .then((res) => (isRejection(res) ? res : res.userId)),
      CreateUserByEmailInviteResponseWrap
    );
  }
}
