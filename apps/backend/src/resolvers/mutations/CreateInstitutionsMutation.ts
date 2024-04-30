import {
  Args,
  ArgsType,
  Ctx,
  Field,
  Int,
  Mutation,
  Resolver,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { Institution } from '../types/Institution';

@ArgsType()
export class CreateInstitutionsArgs {
  @Field(() => String)
  name: string;

  @Field(() => Int)
  country: number;

  @Field(() => Boolean)
  verified: boolean;
}

@Resolver()
export class CreateInstitutionMutation {
  @Mutation(() => Institution)
  createInstitution(
    @Args() args: CreateInstitutionsArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.admin.createInstitutions(context.user, args);
  }
}
