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
import { SEPReviewer as SEPReviewerBase } from '../../models/SEP';
import { BasicUserDetails } from './BasicUserDetails';
import { Role } from './Role';

@ObjectType()
export class SEPReviewer implements Partial<SEPReviewerBase> {
  @Field(() => Int)
  public userId: number;

  @Field(() => Int)
  public sepId: number;
}

@Resolver(() => SEPReviewer)
export class SEPUserResolver {
  @FieldResolver(() => Role, { nullable: true })
  async role(@Root() sepMember: SEPReviewer, @Ctx() context: ResolverContext) {
    return context.queries.sep.dataSource.getSEPUserRole(
      sepMember.userId,
      sepMember.sepId
    );
  }

  @FieldResolver(() => BasicUserDetails)
  async user(@Root() sepMember: SEPReviewer, @Ctx() context: ResolverContext) {
    return context.queries.user.dataSource.getBasicUserInfo(sepMember.userId);
  }

  @FieldResolver(() => Int)
  async proposalsCount(
    @Root() sepMember: SEPReviewer,
    @Ctx() context: ResolverContext
  ) {
    return context.queries.sep.dataSource.getSEPReviewerProposalCount(
      sepMember.userId
    );
  }
}
