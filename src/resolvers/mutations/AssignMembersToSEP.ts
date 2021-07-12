import {
  Args,
  ArgsType,
  Ctx,
  Field,
  Mutation,
  Resolver,
  Int,
  InputType,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { UserRole } from '../../models/User';
import { SEPResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@ArgsType()
export class UpdateMemberSEPArgs {
  @Field(() => Int)
  public memberId: number;

  @Field(() => Int)
  public sepId: number;

  @Field(() => UserRole)
  public roleId: UserRole;
}

@ArgsType()
export class AssignReviewersToSEPArgs {
  @Field(() => [Int])
  public memberIds: number[];

  @Field(() => Int)
  public sepId: number;
}

@ArgsType()
export class AssignSepReviewersToProposalArgs {
  @Field(() => [Int])
  public memberIds: number[];

  @Field(() => Int)
  public sepId: number;

  @Field(() => Int)
  public proposalPk: number;
}

@ArgsType()
export class RemoveSepReviewerFromProposalArgs {
  @Field(() => Int)
  public memberId: number;

  @Field(() => Int)
  public sepId: number;

  @Field(() => Int)
  public proposalPk: number;
}

@ArgsType()
export class AssignSEPChairAndSecretaryArgs {
  @Field(() => [Int])
  public memberIds: number[];

  @Field(() => Int)
  public sepId: number;
}

@InputType()
export class AssignChairOrSecretaryToSEPInput {
  @Field(() => Int)
  userId: number;

  @Field(() => UserRole)
  roleId: UserRole;

  @Field(() => Int)
  sepId: number;
}

@ArgsType()
export class AssignChairOrSecretaryToSEPArgs {
  @Field(() => AssignChairOrSecretaryToSEPInput)
  public assignChairOrSecretaryToSEPInput: AssignChairOrSecretaryToSEPInput;
}

@Resolver()
export class AssignMembersToSEPMutation {
  @Mutation(() => SEPResponseWrap)
  async assignChairOrSecretary(
    @Args() args: AssignChairOrSecretaryToSEPArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.sep.assignChairOrSecretaryToSEP(context.user, args),
      SEPResponseWrap
    );
  }

  @Mutation(() => SEPResponseWrap)
  async assignReviewersToSEP(
    @Args() args: AssignReviewersToSEPArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.sep.assignReviewersToSEP(context.user, args),
      SEPResponseWrap
    );
  }

  @Mutation(() => SEPResponseWrap)
  async removeMemberFromSep(
    @Args() args: UpdateMemberSEPArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.sep.removeMemberFromSEP(context.user, args),
      SEPResponseWrap
    );
  }

  @Mutation(() => SEPResponseWrap)
  async assignSepReviewersToProposal(
    @Args() args: AssignSepReviewersToProposalArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.sep.assignSepReviewersToProposal(context.user, args),
      SEPResponseWrap
    );
  }

  @Mutation(() => SEPResponseWrap)
  async removeMemberFromSEPProposal(
    @Args() args: RemoveSepReviewerFromProposalArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.sep.removeMemberFromSepProposal(context.user, args),
      SEPResponseWrap
    );
  }
}
