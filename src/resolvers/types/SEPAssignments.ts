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
import { Role } from './Role';

@ObjectType()
export class SEPAssignment {
  @Field(() => Int)
  public proposalId: number;

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
    return context.queries.proposal.dataSource.get(sepAssignment.proposalId);
  }

  @FieldResolver(() => [Role])
  async roles(
    @Root() sepAssignment: SEPAssignment,
    @Ctx() context: ResolverContext
  ) {
    return sepAssignment.sepMemberUserId
      ? context.queries.sep.dataSource.getSEPUserRoles(
          sepAssignment.sepMemberUserId,
          sepAssignment.sepId
        )
      : [];
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
}
