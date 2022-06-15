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
import { InstitutionResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

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
  @Mutation(() => InstitutionResponseWrap)
  createInstitution(
    @Args() args: CreateInstitutionsArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.admin.createInstitutions(context.user, args),
      InstitutionResponseWrap
    );
  }
}
