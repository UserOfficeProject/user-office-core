import {
  Args,
  ArgsType,
  Ctx,
  Directive,
  Field,
  InputType,
  Int,
  Mutation,
  Resolver,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { User } from '../types/User';

@InputType()
export class InstitutionManualInput {
  @Field(() => String)
  public name: string;

  @Field(() => String)
  public country: string;
}

@InputType()
@Directive('@oneOf')
export class InstitutionInput {
  @Field(() => String, { nullable: true })
  public rorId: string | null;

  @Field(() => InstitutionManualInput, { nullable: true })
  public manual: InstitutionManualInput | null;

  @Field(() => Int, { nullable: true })
  public institutionId: number | null;
}

export type GetOrCreateInstitutionInput =
  | InstitutionInput['rorId']
  | InstitutionInput['manual']
  | InstitutionInput['institutionId'];

@ArgsType()
export class UpsertUserByOidcSubArgs {
  @Field(() => String, { nullable: true })
  public userTitle: string | null;

  @Field(() => String)
  public firstName: string;

  @Field(() => String)
  public lastName: string;

  @Field(() => String, { nullable: true })
  public username: string | null;

  @Field(() => String, { nullable: true })
  public preferredName: string | null;

  @Field(() => String)
  public oidcSub: string;

  @Field(() => String, { nullable: true })
  public gender: string | null;

  @Field(() => String, { nullable: true })
  public birthDate: string | null;

  @Field(() => InstitutionInput)
  public institution: InstitutionInput;

  @Field(() => String, { nullable: true })
  public department: string | null;

  @Field(() => String)
  public position: string;

  @Field(() => String)
  public email: string;

  @Field(() => String, { nullable: true })
  public telephone: string | null;
}

@Resolver()
export class UpsertUserByOidcSubMutation {
  @Mutation(() => User)
  upsertUserByOidcSub(
    @Args() input: UpsertUserByOidcSubArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.user.upsertUserByOidcSub(context.user, input);
  }
}
