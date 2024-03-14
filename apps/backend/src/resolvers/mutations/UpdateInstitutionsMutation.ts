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
export class UpdateInstitutionsArgs {
  @Field(() => Int)
  id: number;

  @Field(() => String, { nullable: true })
  name: string;

  @Field(() => Int)
  country: number;

  @Field(() => String, { nullable: true })
  rorId?: string;
}

@Resolver()
export class UpdateInstitutionMutation {
  @Mutation(() => Institution)
  updateInstitution(
    @Args() args: UpdateInstitutionsArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.admin.updateInstitutions(context.user, args);
  }
}
