import { Ctx, Mutation, Resolver, Arg } from 'type-graphql';

import { ResolverContext } from '../../context';
import { isRejection } from '../../models/Rejection';
import { ChangeProposalsStatusInput } from './ChangeProposalsStatusMutation';

@Resolver()
export class ChangeTechniqueProposalsStatusMutation {
  @Mutation(() => Boolean)
  async changeTechniqueProposalsStatus(
    @Arg('changeProposalsStatusInput')
    changeProposalsStatusInput: ChangeProposalsStatusInput,
    @Ctx() context: ResolverContext
  ) {
    const result =
      await context.mutations.proposal.changeTechniqueProposalsStatus(
        context.user,
        changeProposalsStatusInput
      );

    return isRejection(result) ? result : true;
  }
}
