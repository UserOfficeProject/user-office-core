import {
  Resolver,
  Ctx,
  Mutation,
  Field,
  Int,
  ArgsType,
  Args,
  InputType,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { AddSEPMembersRoleResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@InputType()
export class AddSEPMembersRole {
  @Field(() => Int)
  userID: number;

  @Field(() => Int)
  roleID: number;

  @Field(() => Int)
  SEPID: number;
}

@ArgsType()
export class AddSEPMembersRoleArgs {
  @Field(() => [AddSEPMembersRole], { nullable: true })
  public addSEPMembersRole: AddSEPMembersRole[];
}

@Resolver()
export class AddSEPMembersRoleMutation {
  @Mutation(() => AddSEPMembersRoleResponseWrap)
  addSEPMembersRole(
    @Args() args: AddSEPMembersRoleArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.user.addSEPMembersRole(
        context.user,
        args.addSEPMembersRole
      ),
      AddSEPMembersRoleResponseWrap
    );
  }
}
