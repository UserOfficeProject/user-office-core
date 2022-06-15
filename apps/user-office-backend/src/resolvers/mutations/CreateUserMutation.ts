import {
  Args,
  ArgsType,
  Ctx,
  Field,
  Mutation,
  Resolver,
  Int,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { isRejection } from '../../models/Rejection';
import { UserResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@ArgsType()
export class CreateUserArgs {
  @Field(() => String, { nullable: true })
  public user_title?: string;

  @Field()
  public firstname: string;

  @Field(() => String, { nullable: true })
  public middlename?: string;

  @Field()
  public lastname: string;

  @Field()
  public password: string;

  @Field(() => String, { nullable: true })
  public preferredname?: string;

  @Field()
  public orcid: string;

  @Field()
  public orcidHash: string;

  @Field()
  public refreshToken: string;

  @Field()
  public gender: string;

  @Field(() => Int)
  public nationality: number;

  @Field()
  public birthdate: Date;

  @Field(() => Int)
  public organisation: number;

  @Field()
  public department: string;

  @Field()
  public position: string;

  @Field()
  public email: string;

  @Field()
  public telephone: string;

  @Field(() => String, { nullable: true })
  public telephone_alt?: string;

  @Field(() => String, { nullable: true })
  public otherOrganisation?: string;

  @Field(() => Int, { nullable: true })
  public organizationCountry?: number;
}

@Resolver()
export class CreateUserMutation {
  @Mutation(() => UserResponseWrap)
  async createUser(
    @Args() args: CreateUserArgs,
    @Ctx() context: ResolverContext
  ) {
    const res = await context.mutations.user.create(context.user, args);

    return wrapResponse(
      isRejection(res) ? Promise.resolve(res) : Promise.resolve(res.user),
      UserResponseWrap
    );
  }
}
