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
import { AddSEPMembersRoleArgs } from './AddSEPMembersRoleMutation';

@ArgsType()
export class UpdateMemberSEPArgs {
  @Field(() => Int)
  public memberId: number;

  @Field(() => Int)
  public sepId: number;
}

@ArgsType()
export class AssignSEPProposalToMemberArgs {
  @Field(() => Int)
  public memberId: number;

  @Field(() => Int)
  public sepId: number;

  @Field(() => Int)
  public proposalId: number;
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
  async assignChairOrSecretary(
    @Args() args: AddSEPMembersRoleArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.sep.assignChairOrSecretaryToSEP(context.user, args),
      SEPResponseWrap
    );
  }

  @Mutation(() => SEPResponseWrap)
  async assignMember(
    @Args() args: UpdateMemberSEPArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.sep.assignMemberToSEP(context.user, args),
      SEPResponseWrap
    );
  }

  @Mutation(() => SEPResponseWrap)
  async removeMember(
    @Args() args: UpdateMemberSEPArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.sep.removeMemberFromSEP(context.user, args),
      SEPResponseWrap
    );
  }

  @Mutation(() => SEPResponseWrap)
  async assignMemberToSEPProposal(
    @Args() args: AssignSEPProposalToMemberArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.sep.assignMemberToSEPProposal(context.user, args),
      SEPResponseWrap
    );
  }

  @Mutation(() => SEPResponseWrap)
  async removeMemberFromSEPProposal(
    @Args() args: AssignSEPProposalToMemberArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.sep.removeMemberFromSepProposal(context.user, args),
      SEPResponseWrap
    );
  }
}
