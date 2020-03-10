import {
  Ctx,
  Field,
  FieldResolver,
  Int,
  ObjectType,
  Resolver,
  Root
} from "type-graphql";
import { ResolverContext } from "../../context";
import { User as UserOrigin } from "../../models/User";
import { Proposal } from "./Proposal";
import { Review } from "./Review";
import { Role } from "./Role";

@ObjectType()
export class User implements Partial<UserOrigin> {
  @Field(() => Int)
  public id: number;

  @Field(() => String, { nullable: true })
  public user_title: string | null;

  @Field()
  public firstname: string;

  @Field(() => String, { nullable: true })
  public middlename: string | null;

  @Field()
  public lastname: string;

  @Field()
  public username: string;

  @Field(() => String, { nullable: true })
  public preferredname: string | null;

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
  public telephone_alt: string | null;

  @Field()
  public placeholder: boolean;

  @Field()
  public created: string;

  @Field()
  public updated: string;
}

@Resolver(of => User)
export class UserResolver {
  @FieldResolver(() => [Role])
  async roles(@Root() user: User, @Ctx() context: ResolverContext) {
    return (context.queries.user as any).dataSource.getUserRoles(user.id);
  }

  @FieldResolver(() => [Review])
  async reviews(@Root() user: User, @Ctx() context: ResolverContext) {
    return (context.queries.review as any).dataSource.getUserReviews(user.id);
  }

  @FieldResolver(() => [Proposal])
  async proposals(@Root() user: User, @Ctx() context: ResolverContext) {
    return (context.queries.proposal as any).dataSource.getUserProposals(
      user.id
    );
  }
}
