import {
  Args,
  ArgsType,
  Ctx,
  Field,
  Mutation,
  Resolver,
  Int,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { SEPResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@ArgsType()
export class UpdateMemberSEPArgs {
  @Field(() => Int)
  public memberId: number;

  @Field(() => Int)
  public sepId: number;
}

@ArgsType()
export class AssignSEPChairAndSecretaryArgs {
  @Field(() => [Int])
  public memberIds: number[];

  @Field(() => Int)
  public sepId: number;
}

@Resolver()
export class AssignMembersToSEPMutation {
  @Mutation(() => SEPResponseWrap)
  async assignChairAndSecretary(
    @Args() args: AssignSEPChairAndSecretaryArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.sep.assignChairAndSecretary(context.user, args),
      SEPResponseWrap
    );
  }
  @Mutation(() => SEPResponseWrap)
  async assignMember(
    @Args() args: UpdateMemberSEPArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.sep.assignMember(context.user, args),
      SEPResponseWrap
    );
  }

  @Mutation(() => SEPResponseWrap)
  async removeMember(
    @Args() args: UpdateMemberSEPArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.sep.removeMember(context.user, args),
      SEPResponseWrap
    );
  }
}
