import {
  Ctx,
  Directive,
  Field,
  FieldResolver,
  Int,
  ObjectType,
  Resolver,
  Root,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { User as UserOrigin } from '../../models/User';
import { Instrument } from './Instrument';
import { Proposal } from './Proposal';
import { Review } from './Review';
import { Role } from './Role';
import { SEP } from './SEP';

@ObjectType()
@Directive('@key(fields: "id")')
export class User implements Partial<UserOrigin> {
  @Field(() => Int)
  public id: number;

  @Field(() => String)
  public user_title: string;

  @Field()
  public firstname: string;

  @Field(() => String, { nullable: true })
  public middlename: string | undefined;

  @Field()
  public lastname: string;

  @Field()
  public username: string;

  @Field(() => String, { nullable: true })
  public preferredname: string | undefined;

  @Field()
  public orcid: string;

  @Field()
  public refreshToken: string;

  @Field()
  public gender: string;

  @Field(() => Int, { nullable: true })
  public nationality: number;

  @Field()
  public birthdate: string;

  @Field(() => Int)
  public organisation: number;

  @Field()
  public department: string;

  @Field()
  public position: string;

  @Field()
  public email: string;

  @Field()
  public emailVerified: boolean;

  @Field()
  public telephone: string;

  @Field(() => String, { nullable: true })
  public telephone_alt: string | undefined;

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
  async reviews(@Root() user: User, @Ctx() context: ResolverContext) {
    return context.queries.review.dataSource.getUserReviews(user.id);
  }

  @FieldResolver(() => [Proposal])
  async proposals(@Root() user: User, @Ctx() context: ResolverContext) {
    return context.queries.proposal.dataSource.getUserProposals(user.id);
  }

  @FieldResolver(() => [SEP])
  async seps(@Root() user: User, @Ctx() context: ResolverContext) {
    if (!context.user || !context.user.currentRole) {
      return [];
    }

    return context.queries.sep.dataSource.getUserSeps(
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
  // this was the easies way to make the compiler happy and use real types
  const [reference, ctx]: [Pick<User, 'id'>, ResolverContext] = params;

  // dataSource.get can be null, even with non-null operator the compiler complains
  return (await (ctx.queries.user.byRef(
    ctx.user,
    reference.id
  ) as unknown)) as User;
}
