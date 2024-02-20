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

  public fapChairUserId: number | null;

  public fapSecretariesUserIds: number[] | null;
}

@Resolver(() => Fap)
export class FapResolvers {
  @FieldResolver(() => BasicUserDetails, { nullable: true })
  async fapChair(@Root() fap: Fap, @Ctx() context: ResolverContext) {
    if (!fap.fapChairUserId) {
      return null;
    }

    return context.queries.user.getBasic(context.user, fap.fapChairUserId);
  }

  @FieldResolver(() => Int, { nullable: true })
  async fapChairProposalCount(
    @Root() fap: Fap,
    @Ctx() context: ResolverContext
  ) {
    if (!fap.fapChairUserId) {
      return null;
    }

    return context.queries.fap.dataSource.getFapReviewerProposalCount(
      fap.fapChairUserId
    );
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
  async fapSecretariesProposalCounts(
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
          context.queries.fap.dataSource.getFapReviewerProposalCount(
            fapSecretariesUserId
          ),
      };
    });
  }

  @FieldResolver(() => Int)
  async proposalCount(@Root() fap: Fap, @Ctx() context: ResolverContext) {
    return context.queries.fap.dataSource.getFapProposalCount(fap.id);
  }
}
