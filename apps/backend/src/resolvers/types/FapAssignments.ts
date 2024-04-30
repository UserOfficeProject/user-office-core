import {
  ObjectType,
  Field,
  Int,
  Resolver,
  FieldResolver,
  Root,
  Ctx,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { BasicUserDetails } from './BasicUserDetails';
import { Proposal } from './Proposal';
import { Review } from './Review';
import { Role } from './Role';

@ObjectType()
export class FapAssignment {
  @Field(() => Int)
  public proposalPk: number;

  @Field(() => Int, { nullable: true })
  public fapMemberUserId: number | null;

  @Field(() => Int)
  public fapId: number;

  @Field(() => Date)
  public dateAssigned: Date;

  @Field(() => Boolean)
  public reassigned: boolean;

  @Field(() => Date, { nullable: true })
  public dateReassigned: Date | null;

  @Field(() => Boolean)
  public emailSent: boolean;

  @Field(() => Int, { nullable: true })
  public rank: number | null;
}

@Resolver(() => FapAssignment)
export class FapUserResolver {
  @FieldResolver(() => Proposal)
  async proposal(
    @Root() fapAssignment: FapAssignment,
    @Ctx() context: ResolverContext
  ) {
    return context.queries.proposal.dataSource.get(fapAssignment.proposalPk);
  }

  @FieldResolver(() => Role, { nullable: true })
  async role(
    @Root() fapAssignment: FapAssignment,
    @Ctx() context: ResolverContext
  ) {
    return fapAssignment.fapMemberUserId
      ? context.queries.fap.dataSource.getFapUserRole(
          fapAssignment.fapMemberUserId,
          fapAssignment.fapId
        )
      : null;
  }

  @FieldResolver(() => BasicUserDetails, { nullable: true })
  async user(
    @Root() fapAssignment: FapAssignment,
    @Ctx() context: ResolverContext
  ) {
    return fapAssignment.fapMemberUserId
      ? context.queries.user.dataSource.getBasicUserInfo(
          fapAssignment.fapMemberUserId
        )
      : null;
  }

  @FieldResolver(() => Review, { nullable: true })
  async review(
    @Root() fapAssignment: FapAssignment,
    @Ctx() context: ResolverContext
  ) {
    return fapAssignment.fapMemberUserId
      ? context.queries.review.dataSource.getAssignmentReview(
          fapAssignment.fapId,
          fapAssignment.proposalPk,
          fapAssignment.fapMemberUserId
        )
      : null;
  }
}
