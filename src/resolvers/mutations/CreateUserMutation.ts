import {
  Mutation,
  Args,
  Ctx,
  Resolver,
  ObjectType,
  Field,
  ArgsType
} from "type-graphql";
import { ResolverContext } from "../../context";
import { isRejection } from "../../rejection";
import { AbstractResponseWrap, wrapResponse } from "../Utils";
import { User } from "../../models/User";

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

  @Field()
  public nationality: number;

  @Field()
  public birthdate: string;

  @Field()
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
}

@ObjectType()
class UserResponseWrap extends AbstractResponseWrap<User> {
  @Field(() => User, { nullable: true })
  public user: User;

  setValue(value: User): void {
    this.user = value;
  }
}

const wrap = wrapResponse<User>(new UserResponseWrap());

@Resolver()
export class CreateUserMutation {
  @Mutation(() => UserResponseWrap)
  async createUser(
    @Args() args: CreateUserArgs,
    @Ctx() context: ResolverContext
  ) {
    const res = await context.mutations.user.create(args);

    return wrap(
      isRejection(res) ? Promise.resolve(res) : Promise.resolve(res.user)
    );
  }
}
