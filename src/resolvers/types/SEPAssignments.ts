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
import { Role } from './Role';

@ObjectType()
export class SEPAssignment {
  @Field(() => Int, { nullable: true })
  public proposalId: number | null;

  @Field(() => Int)
  public sepMemberUserId: number;

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
  @FieldResolver(() => [Role])
  async roles(
    @Root() sepAssignment: SEPAssignment,
    @Ctx() context: ResolverContext
  ) {
    return context.queries.user.dataSource.getSEPUserRoles(
      sepAssignment.sepMemberUserId,
      sepAssignment.sepId
    );
  }

  @FieldResolver(() => BasicUserDetails)
  async user(
    @Root() sepAssignment: SEPAssignment,
    @Ctx() context: ResolverContext
  ) {
    return context.queries.user.dataSource.getBasicUserInfo(
      sepAssignment.sepMemberUserId
    );
  }
}
