import {
  Ctx,
  Field,
  FieldResolver,
  Float,
  Int,
  ObjectType,
  Resolver,
  Root,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { Review as ReviewOrigin, ReviewStatus } from '../../models/Review';
import { TemplateCategoryId } from '../../models/Template';
import { Proposal } from '../types/Proposal';
import { BasicUserDetails } from './BasicUserDetails';
import { Questionary } from './Questionary';

@ObjectType()
export class Review implements Partial<ReviewOrigin> {
  @Field(() => Int)
  public id: number;

  @Field(() => Int)
  public userID: number;

  @Field({ nullable: true })
  public comment?: string;

  @Field(() => Float, { nullable: true })
  public grade?: number;

  @Field(() => ReviewStatus)
  public status: ReviewStatus;

  public proposalPk: number;

  @Field(() => Int)
  public fapID: number;

  @Field(() => Int)
  public questionaryID: number;
}

@Resolver(() => Review)
export class ReviewResolver {
  @FieldResolver(() => BasicUserDetails, { nullable: true })
  async reviewer(
    @Root() review: Review,
    @Ctx() context: ResolverContext
  ): Promise<BasicUserDetails | null> {
    return context.queries.user.getBasic(context.user, review.userID);
  }

  @FieldResolver(() => Proposal, { nullable: true })
  async proposal(
    @Root() review: Review,
    @Ctx() context: ResolverContext
  ): Promise<Proposal | null> {
    return context.queries.proposal.get(context.user, review.proposalPk);
  }

  @FieldResolver(() => Questionary)
  async questionary(
    @Root() review: Review,
    @Ctx() context: ResolverContext
  ): Promise<Questionary> {
    return context.queries.questionary.getQuestionaryOrDefault(
      context.user,
      review.questionaryID,
      TemplateCategoryId.FAP_REVIEW
    );
  }
}
