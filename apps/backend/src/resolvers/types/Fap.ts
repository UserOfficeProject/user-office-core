import {
  ObjectType,
  Field,
  Int,
  FieldResolver,
  Resolver,
  Root,
  Ctx,
  Arg,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import {
  Fap as FapBase,
  FapProposalCount as FapProposalCountBase,
} from '../../models/Fap';
import { BasicUserDetails } from './BasicUserDetails';

@ObjectType()
export class FapProposalCount implements FapProposalCountBase {
  @Field(() => Int)
  public userId: number;

  @Field(() => Int)
  public count: number;
}
@ObjectType()
export class Fap implements Partial<FapBase> {
  @Field(() => Int)
  public id: number;

  @Field(() => String)
  public code: string;

  @Field(() => String)
  public description: string;

  @Field(() => Number)
  public numberRatingsRequired: number;

  @Field(() => String, { nullable: true })
  public gradeGuide: string;

  @Field(() => Boolean, { nullable: true })
  public customGradeGuide: boolean | null;

  @Field(() => Boolean)
  public active: boolean;

  public fapChairUserIds: number[] | null;

  public fapSecretariesUserIds: number[] | null;

  @Field(() => String, { nullable: true })
  public files: string | null;
}

@Resolver(() => Fap)
export class FapResolvers {
  @FieldResolver(() => [BasicUserDetails])
  async fapChairs(@Root() fap: Fap, @Ctx() context: ResolverContext) {
    if (!fap.fapChairUserIds) {
      return [];
    }

    return fap.fapChairUserIds.map((fapChairUserId) =>
      context.queries.user.getBasic(context.user, fapChairUserId)
    );
  }

  @FieldResolver(() => [FapProposalCount])
  async fapChairsCurrentProposalCounts(
    @Root() fap: Fap,
    @Ctx() context: ResolverContext
  ) {
    if (!fap.fapChairUserIds) {
      return [];
    }

    return fap.fapChairUserIds.map((fapChairUserId) => {
      return {
        userId: fapChairUserId,
        count:
          context.queries.fap.dataSource.getCurrentFapReviewerProposalCount(
            fapChairUserId
          ),
      };
    });
  }

  @FieldResolver(() => [BasicUserDetails])
  async fapSecretaries(@Root() fap: Fap, @Ctx() context: ResolverContext) {
    if (!fap.fapSecretariesUserIds) {
      return [];
    }

    return fap.fapSecretariesUserIds.map((fapSecretariesUserId) =>
      context.queries.user.getBasic(context.user, fapSecretariesUserId)
    );
  }

  @FieldResolver(() => [FapProposalCount])
  async fapSecretariesCurrentProposalCounts(
    @Root() fap: Fap,
    @Ctx() context: ResolverContext
  ) {
    if (!fap.fapSecretariesUserIds) {
      return [];
    }

    return fap.fapSecretariesUserIds.map((fapSecretariesUserId) => {
      return {
        userId: fapSecretariesUserId,
        count:
          context.queries.fap.dataSource.getCurrentFapReviewerProposalCount(
            fapSecretariesUserId
          ),
      };
    });
  }

  @FieldResolver(() => Int)
  async proposalCount(@Root() fap: Fap, @Ctx() context: ResolverContext) {
    return context.queries.fap.dataSource.getFapProposalCount(fap.id);
  }

  @FieldResolver(() => Int)
  async proposalCurrentCount(
    @Root() fap: Fap,
    @Ctx() context: ResolverContext,
    @Arg('callId', () => Int, { nullable: true }) callId: number | null
  ) {
    return context.queries.fap.dataSource.getCurrentFapProposalCount(
      fap.id,
      callId
    );
  }
}
