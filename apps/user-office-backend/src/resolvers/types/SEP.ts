import {
  ObjectType,
  Field,
  Int,
  FieldResolver,
  Resolver,
  Root,
  Ctx,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { SEP as SEPBase } from '../../models/SEP';
import { BasicUserDetails } from './BasicUserDetails';

@ObjectType()
export class SEP implements Partial<SEPBase> {
  @Field(() => Int)
  public id: number;

  @Field(() => String)
  public code: string;

  @Field(() => String)
  public description: string;

  @Field(() => Number)
  public numberRatingsRequired: number;

  @Field(() => Boolean)
  public active: boolean;

  public sepChairUserId: number | null;

  public sepSecretaryUserId: number | null;
}

@Resolver(() => SEP)
export class SEPResolvers {
  @FieldResolver(() => BasicUserDetails, { nullable: true })
  async sepChair(@Root() sep: SEP, @Ctx() context: ResolverContext) {
    if (!sep.sepChairUserId) {
      return null;
    }

    return context.queries.user.getBasic(context.user, sep.sepChairUserId);
  }

  @FieldResolver(() => Int, { nullable: true })
  async sepChairProposalCount(
    @Root() sep: SEP,
    @Ctx() context: ResolverContext
  ) {
    if (!sep.sepChairUserId) {
      return null;
    }

    return context.queries.sep.dataSource.getSEPReviewerProposalCount(
      sep.sepChairUserId
    );
  }

  @FieldResolver(() => BasicUserDetails, { nullable: true })
  async sepSecretary(@Root() sep: SEP, @Ctx() context: ResolverContext) {
    if (!sep.sepSecretaryUserId) {
      return null;
    }

    return context.queries.user.getBasic(context.user, sep.sepSecretaryUserId);
  }

  @FieldResolver(() => Int, { nullable: true })
  async sepSecretaryProposalCount(
    @Root() sep: SEP,
    @Ctx() context: ResolverContext
  ) {
    if (!sep.sepSecretaryUserId) {
      return null;
    }

    return context.queries.sep.dataSource.getSEPReviewerProposalCount(
      sep.sepSecretaryUserId
    );
  }

  @FieldResolver(() => Int)
  async proposalCount(@Root() sep: SEP, @Ctx() context: ResolverContext) {
    return context.queries.sep.dataSource.getSEPProposalCount(sep.id);
  }
}
