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
import { Fap } from '../types/Fap';

@ArgsType()
export class UpdateMemberFapArgs {
  @Field(() => Int)
  public memberId: number;

  @Field(() => Int)
  public fapId: number;

  @Field(() => UserRole)
  public roleId: UserRole;
}

@ArgsType()
export class AssignReviewersToFapArgs {
  @Field(() => [Int])
  public memberIds: number[];

  @Field(() => Int)
  public fapId: number;
}

@ArgsType()
export class AssignFapReviewersToProposalArgs {
  @Field(() => [Int])
  public memberIds: number[];

  @Field(() => Int)
  public fapId: number;

  @Field(() => Int)
  public proposalPk: number;
}

@ArgsType()
export class RemoveFapReviewerFromProposalArgs {
  @Field(() => Int)
  public memberId: number;

  @Field(() => Int)
  public fapId: number;

  @Field(() => Int)
  public proposalPk: number;
}

@ArgsType()
export class AssignFapChairAndSecretaryArgs {
  @Field(() => [Int])
  public memberIds: number[];

  @Field(() => Int)
  public fapId: number;
}

@InputType()
export class AssignChairOrSecretaryToFapInput {
  @Field(() => Int)
  userId: number;

  @Field(() => UserRole)
  roleId: UserRole;

  @Field(() => Int)
  fapId: number;
}

@ArgsType()
export class AssignChairOrSecretaryToFapArgs {
  @Field(() => AssignChairOrSecretaryToFapInput)
  public assignChairOrSecretaryToFapInput: AssignChairOrSecretaryToFapInput;
}

@Resolver()
export class AssignMembersToFapMutation {
  @Mutation(() => Fap)
  async assignChairOrSecretary(
    @Args() args: AssignChairOrSecretaryToFapArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.fap.assignChairOrSecretaryToFap(
      context.user,
      args
    );
  }

  @Mutation(() => Fap)
  async assignReviewersToFap(
    @Args() args: AssignReviewersToFapArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.fap.assignReviewersToFap(context.user, args);
  }

  @Mutation(() => Fap)
  async removeMemberFromFap(
    @Args() args: UpdateMemberFapArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.fap.removeMemberFromFap(context.user, args);
  }

  @Mutation(() => Fap)
  async assignFapReviewersToProposal(
    @Args() args: AssignFapReviewersToProposalArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.fap.assignFapReviewersToProposal(
      context.user,
      args
    );
  }

  @Mutation(() => Fap)
  async removeMemberFromFapProposal(
    @Args() args: RemoveFapReviewerFromProposalArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.fap.removeMemberFromFapProposal(
      context.user,
      args
    );
  }
}
