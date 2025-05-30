import {
  Arg,
  ArgsType,
  Ctx,
  Directive,
  Field,
  FieldResolver,
  InputType,
  Int,
  ObjectType,
  Resolver,
  Root,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { ProposalEndStatus } from '../../models/Proposal';
import { ReviewerFilter, ReviewStatus } from '../../models/Review';
import { User as UserOrigin } from '../../models/User';
import { UserExperimentsFilter } from '../queries/ExperimentsQuery';
import { Experiment } from './Experiment';
import { Fap } from './Fap';
import { Instrument } from './Instrument';
import { Proposal } from './Proposal';
import { Review } from './Review';
import { Role } from './Role';

@InputType()
export class UserProposalsFilter {
  @Field(() => Int, { nullable: true })
  public instrumentId?: number;

  @Field(() => Boolean, { nullable: true })
  public managementDecisionSubmitted?: boolean;

  @Field(() => ProposalEndStatus, { nullable: true })
  public finalStatus?: ProposalEndStatus;
}

@ArgsType()
export class UserProposalsArgs {
  @Field(() => UserProposalsFilter, { nullable: true })
  filter?: UserProposalsFilter;
}

@ObjectType()
@Directive('@key(fields: "id")')
export class User implements Partial<UserOrigin> {
  @Field(() => Int)
  public id: number;

  @Field(() => String)
  public user_title: string;

  @Field()
  public firstname: string;

  @Field()
  public lastname: string;

  @Field()
  public username: string;

  @Field(() => String, { nullable: true })
  public preferredname: string | undefined;

  @Field(() => String, { nullable: true })
  public oidcSub: string | null;

  @Field(() => String, { nullable: true })
  public oauthRefreshToken: string | null;

  @Field()
  public gender: string;

  @Field()
  public birthdate: Date;

  @Field(() => Int)
  public institutionId: number;

  @Field()
  public department: string;

  @Field()
  public position: string;

  @Field()
  public email: string;

  @Field()
  public telephone: string;

  @Field()
  public placeholder: boolean;

  @Field()
  public created: string;

  @Field()
  public updated: string;
}

@Resolver(() => User)
export class UserResolver {
  @FieldResolver(() => [Role])
  async roles(@Root() user: User, @Ctx() context: ResolverContext) {
    return context.queries.user.dataSource.getUserRoles(user.id);
  }

  @FieldResolver(() => [Review])
  async reviews(
    @Root() user: User,
    @Arg('callId', () => Int, { nullable: true }) callId: number,
    @Arg('instrumentId', () => Int, { nullable: true }) instrumentId: number,
    @Arg('status', () => ReviewStatus, { nullable: true }) status: number,
    @Arg('reviewer', () => ReviewerFilter, { nullable: true })
    reviewer: number,
    @Ctx() context: ResolverContext
  ) {
    if (!context.user || !context.user.currentRole) {
      return [];
    }

    const fapsUserIsMemberOf =
      await context.queries.fap.dataSource.getUserFapsByRoleAndFapId(
        user.id,
        context.user.currentRole
      );

    const shouldGetOnlyUserReviews = !reviewer;

    if (shouldGetOnlyUserReviews) {
      return context.queries.review.dataSource.getUserReviews(
        fapsUserIsMemberOf.map((faps) => faps.id),
        user.id,
        callId,
        instrumentId,
        status
      );
    } else {
      return context.queries.review.dataSource.getAllUsersReviews(
        fapsUserIsMemberOf.map((faps) => faps.id),
        user.id,
        callId,
        instrumentId,
        status
      );
    }
  }

  @FieldResolver(() => [Proposal])
  async proposals(
    @Root() user: User,
    @Ctx() context: ResolverContext,
    @Arg('filter', () => UserProposalsFilter, { nullable: true })
    filter: UserProposalsFilter
  ) {
    return context.queries.proposal.dataSource.getUserProposals(
      user.id,
      filter
    );
  }

  @FieldResolver(() => [Experiment])
  async experiments(
    @Root() user: User,
    @Ctx() context: ResolverContext,
    @Arg('filter', () => UserExperimentsFilter, { nullable: true })
    filter: UserExperimentsFilter
  ) {
    return context.queries.experiment.dataSource.getUserExperiments(
      user.id,
      filter
    );
  }

  @FieldResolver(() => [Fap])
  async faps(@Root() user: User, @Ctx() context: ResolverContext) {
    if (!context.user || !context.user.currentRole) {
      return [];
    }

    return context.queries.fap.dataSource.getUserFaps(
      user.id,
      context.user.currentRole
    );
  }

  @FieldResolver(() => [Instrument])
  async instruments(@Root() user: User, @Ctx() context: ResolverContext) {
    return context.queries.instrument.dataSource.getUserInstruments(user.id);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function resolveUserReference(...params: any): Promise<User> {
  // the order of the parameters and types are messed up,
  // it should be source, args, context, resolveInfo
  // but instead we get source, context and resolveInfo
  // this was the easiest way to make the compiler happy and use real types
  const [reference, ctx]: [Pick<User, 'id'>, ResolverContext] = params;

  // dataSource.get can be null, even with non-null operator the compiler complains
  return (await (ctx.queries.user.byRef(
    ctx.user,
    reference.id
  ) as unknown)) as User;
}
