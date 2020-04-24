import {
  Resolver,
  Ctx,
  Mutation,
  Field,
  Int,
  Args,
  ArgsType,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { SEPMembersRoleResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@ArgsType()
export class RemoveSEPMemberRole {
  @Field(() => Int)
  memberId: number;

  @Field(() => Int)
  sepId: number;
}

@Resolver()
export class RemoveSEPMemberRoleMutation {
  @Mutation(() => SEPMembersRoleResponseWrap)
  removeSEPMemberRole(
    @Args() args: RemoveSEPMemberRole,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.user.removeSEPMemberRole(context.user, args),
      SEPMembersRoleResponseWrap
    );
  }
}
