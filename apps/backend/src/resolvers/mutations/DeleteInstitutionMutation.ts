import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Institution } from '../types/Institution';

@Resolver()
export class DeleteInstitutionlMutation {
  @Mutation(() => Institution)
  deleteInstitution(
    @Arg('id', () => Int) id: number,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.admin.deleteInstitutions(context.user, id);
  }
}
