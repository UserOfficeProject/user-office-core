import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { InstitutionResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@Resolver()
export class DeleteInstitutionlMutation {
  @Mutation(() => InstitutionResponseWrap)
  deleteInstitution(
    @Arg('id', () => Int) id: number,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.admin.deleteInstitutions(context.user, id),
      InstitutionResponseWrap
    );
  }
}
