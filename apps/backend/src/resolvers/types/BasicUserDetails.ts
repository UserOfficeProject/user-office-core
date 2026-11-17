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
  public preferredname: string | undefined;

  @Field({ deprecationReason: 'Use institutionName instead.' })
  public institution: string;

  @Field()
  public institutionName: string;

  @Field(() => String, { nullable: true })
  public institutionRorId: string | null;

  @Field(() => String, { nullable: true })
  public institutionCountry: string | null;

  @Field(() => Int)
  public institutionId: number;

  @Authorized([
    Roles.USER_OFFICER,
    Roles.INSTRUMENT_SCIENTIST,
    Roles.INTERNAL_REVIEWER,
  ])
  @Field({ nullable: true })
  public email: string;

  @Field(() => Date, { nullable: true })
  public created?: Date;

  @Field({ nullable: true })
  public country: string;

  @Field(() => String, { nullable: true })
  public oidcSub?: string | null;

  @Field(() => String, { nullable: true })
  public userTitle?: string;
}

export async function resolveBasicUserDetailsReference(
  ...params: any
): Promise<BasicUserDetails | null> {
  // the order of the parameters and types are messed up,
  // it should be source, args, context, resolveInfo
  // but instead we get source, context and resolveInfo
  // this was the easiest way to make the compiler happy and use real types
  const [reference, ctx]: [Pick<BasicUserDetails, 'id'>, ResolverContext] =
    params;

  return ctx.queries.user.basicByRef(ctx.user, reference.id);
}
