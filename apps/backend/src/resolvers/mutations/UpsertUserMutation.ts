import {
  Args,
  ArgsType,
  Ctx,
  Directive,
  Field,
  InputType,
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
  public institutionData: InstitutionManualInput | null;
}

export type GetOrCreateInstitutionInput =
  | InstitutionInput['rorId']
  | InstitutionInput['institutionData'];

@ArgsType()
export class UpsertUserByOidcSubArgs {
  @Field(() => String, { nullable: true })
  public userTitle: string | null;

  @Field(() => String)
  public firstName: string;

  @Field(() => String)
  public lastName: string;

  @Field(() => String, { nullable: true })
  public preferredName: string | null;

  @Field(() => String)
  public oidcSub: string;

  @Field(() => InstitutionInput)
  public institution: InstitutionInput;

  @Field(() => String)
  public email: string;
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
