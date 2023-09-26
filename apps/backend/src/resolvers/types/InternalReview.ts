import {
  Ctx,
  Field,
  FieldResolver,
  Int,
  ObjectType,
  Resolver,
  Root,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { InternalReview as InternalReviewOrigin } from '../../models/InternalReview';
import { BasicUserDetails } from './BasicUserDetails';

@ObjectType()
export class InternalReview implements Partial<InternalReviewOrigin> {
  @Field(() => Int)
  public id: number;

  @Field()
  public title: string;

  @Field(() => String, { nullable: true })
  public comment: string | null;

  @Field(() => String, { nullable: true })
  public files: string | null;

  @Field(() => Int)
  public reviewerId: number;

  @Field(() => Int)
  public technicalReviewId: number;

  @Field(() => Date)
  public createdAt: Date;

  @Field(() => Int)
  public assignedBy: number;
}

@Resolver(() => InternalReview)
export class InternalReviewResolver {
  @FieldResolver(() => BasicUserDetails, { nullable: true })
  async reviewer(
    @Root() internalReview: InternalReview,
    @Ctx() context: ResolverContext
  ): Promise<BasicUserDetails | null> {
    return context.queries.user.getBasic(
      context.user,
      internalReview.reviewerId
    );
  }

  @FieldResolver(() => BasicUserDetails, { nullable: true })
  async assignedByUser(
    @Root() internalReview: InternalReview,
    @Ctx() context: ResolverContext
  ): Promise<BasicUserDetails | null> {
    return context.queries.user.getBasic(
      context.user,
      internalReview.assignedBy
    );
  }
}
