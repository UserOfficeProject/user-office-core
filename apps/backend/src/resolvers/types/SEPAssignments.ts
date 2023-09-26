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
export class SEPAssignment {
  @Field(() => Int)
  public proposalPk: number;

  @Field(() => Int, { nullable: true })
  public sepMemberUserId: number | null;

  @Field(() => Int)
  public sepId: number;

  @Field(() => Date)
  public dateAssigned: Date;

  @Field(() => Boolean)
  public reassigned: boolean;

  @Field(() => Date, { nullable: true })
  public dateReassigned: Date | null;

  @Field(() => Boolean)
  public emailSent: boolean;
}

@Resolver(() => SEPAssignment)
export class SEPUserResolver {
  @FieldResolver(() => Proposal)
  async proposal(
    @Root() sepAssignment: SEPAssignment,
    @Ctx() context: ResolverContext
  ) {
    return context.queries.proposal.dataSource.get(sepAssignment.proposalPk);
  }

  @FieldResolver(() => Role, { nullable: true })
  async role(
    @Root() sepAssignment: SEPAssignment,
    @Ctx() context: ResolverContext
  ) {
    return sepAssignment.sepMemberUserId
      ? context.queries.sep.dataSource.getSEPUserRole(
          sepAssignment.sepMemberUserId,
          sepAssignment.sepId
        )
      : null;
  }

  @FieldResolver(() => BasicUserDetails, { nullable: true })
  async user(
    @Root() sepAssignment: SEPAssignment,
    @Ctx() context: ResolverContext
  ) {
    return sepAssignment.sepMemberUserId
      ? context.queries.user.dataSource.getBasicUserInfo(
          sepAssignment.sepMemberUserId
        )
      : null;
  }

  @FieldResolver(() => Review, { nullable: true })
  async review(
    @Root() sepAssignment: SEPAssignment,
    @Ctx() context: ResolverContext
  ) {
    return sepAssignment.sepMemberUserId
      ? context.queries.review.dataSource.getAssignmentReview(
          sepAssignment.sepId,
          sepAssignment.proposalPk,
          sepAssignment.sepMemberUserId
        )
      : null;
  }
}
