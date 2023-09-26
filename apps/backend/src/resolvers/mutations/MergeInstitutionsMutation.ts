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
  @Mutation(() => Institution)
  mergeInstitutions(
    @Args()
    input: MergeInstitutionsInput,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.admin.mergeInstitutions(context.user, input);
  }
}
