import { Authorized, Directive, Field, Int, ObjectType } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Roles } from '../../models/Role';
import { BasicUserDetails as BasicUserDetailsOrigin } from '../../models/User';

@ObjectType()
@Directive('@key(fields: "id")')
export class BasicUserDetails implements Partial<BasicUserDetailsOrigin> {
  @Field(() => Int)
  public id: number;

  @Field()
  public firstname: string;

  @Field()
  public lastname: string;

  @Field(() => String, { nullable: true })
  public preferredname?: string | null;

  @Field(() => String, { nullable: true })
  public institution?: string | null;

  @Field(() => Int, { nullable: true })
  public institutionId?: number | null;

  @Field()
  public position: string;

  @Authorized([
    Roles.USER_OFFICER,
    Roles.INSTRUMENT_SCIENTIST,
    Roles.INTERNAL_REVIEWER,
  ])
  @Field(() => String, { nullable: true })
  public email?: string | null;

  @Field(() => Boolean, { nullable: true })
  public placeholder?: boolean | null;

  @Field(() => Date)
  public created: Date;

  @Field({ nullable: true })
  public country: string;

  @Field(() => String, { nullable: true })
  public oidc_sub?: string | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function resolveBasicUserDetailsReference(
  ...params: any
): Promise<BasicUserDetails> {
  // the order of the parameters and types are messed up,
  // it should be source, args, context, resolveInfo
  // but instead we get source, context and resolveInfo
  // this was the easiest way to make the compiler happy and use real types
  const [reference, ctx]: [Pick<BasicUserDetails, 'id'>, ResolverContext] =
    params;

  // dataSource.get can be null, even with non-null operator the compiler complains
  return (await (ctx.queries.user.byRef(
    ctx.user,
    reference.id
  ) as unknown)) as BasicUserDetails;
}
