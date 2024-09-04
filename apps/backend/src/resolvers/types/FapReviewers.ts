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
import { FapReviewer as FapReviewerBase } from '../../models/Fap';
import { BasicUserDetails } from './BasicUserDetails';
import { Role } from './Role';

@ObjectType()
export class FapReviewer implements Partial<FapReviewerBase> {
  @Field(() => Int)
  public userId: number;

  @Field(() => Int)
  public fapId: number;
}

@Resolver(() => FapReviewer)
export class FapUserResolver {
  @FieldResolver(() => Role, { nullable: true })
  async role(@Root() fapMember: FapReviewer, @Ctx() context: ResolverContext) {
    return context.queries.fap.dataSource.getFapUserRole(
      fapMember.userId,
      fapMember.fapId
    );
  }

  @FieldResolver(() => BasicUserDetails)
  async user(@Root() fapMember: FapReviewer, @Ctx() context: ResolverContext) {
    return context.queries.user.dataSource.getBasicUserInfo(fapMember.userId);
  }

  @FieldResolver(() => Int)
  async proposalsCount(
    @Root() fapMember: FapReviewer,
    @Ctx() context: ResolverContext
  ) {
    return context.queries.fap.dataSource.getFapReviewerProposalCount(
      fapMember.userId
    );
  }

  @FieldResolver(() => Int)
  async proposalsCountByCall(
    @Root() fapMember: FapReviewer,
    @Ctx() context: ResolverContext
  ) {
    return context.queries.fap.dataSource.getCurrentFapReviewerProposalCount(
      fapMember.userId
    );
  }
}
