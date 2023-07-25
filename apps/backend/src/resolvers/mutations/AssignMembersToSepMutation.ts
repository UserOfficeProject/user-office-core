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
import { SEP } from '../types/SEP';

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
  @Mutation(() => SEP)
  async assignChairOrSecretary(
    @Args() args: AssignChairOrSecretaryToSEPArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.sep.assignChairOrSecretaryToSEP(
      context.user,
      args
    );
  }

  @Mutation(() => SEP)
  async assignReviewersToSEP(
    @Args() args: AssignReviewersToSEPArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.sep.assignReviewersToSEP(context.user, args);
  }

  @Mutation(() => SEP)
  async removeMemberFromSep(
    @Args() args: UpdateMemberSEPArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.sep.removeMemberFromSEP(context.user, args);
  }

  @Mutation(() => SEP)
  async assignSepReviewersToProposal(
    @Args() args: AssignSepReviewersToProposalArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.sep.assignSepReviewersToProposal(
      context.user,
      args
    );
  }

  @Mutation(() => SEP)
  async removeMemberFromSEPProposal(
    @Args() args: RemoveSepReviewerFromProposalArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.sep.removeMemberFromSepProposal(
      context.user,
      args
    );
  }
}
