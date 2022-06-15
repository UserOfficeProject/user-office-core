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
import { wrapResponse } from '../wrapResponse';
import { InstitutionResponseWrap } from './../types/CommonWrappers';

@ArgsType()
export class MergeInstitutionsInput {
  @Field(() => Int)
  public institutionIdFrom: number;

  @Field(() => Int)
  public institutionIdInto: number;

  @Field(() => String)
  public newTitle: string;
}

@Resolver()
export class MergeInstitutionsMutation {
  @Mutation(() => InstitutionResponseWrap)
  mergeInstitutions(
    @Args()
    input: MergeInstitutionsInput,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.admin.mergeInstitutions(context.user, input),
      InstitutionResponseWrap
    );
  }
}
