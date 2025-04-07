import { Ctx, Mutation, Resolver, Arg } from 'type-graphql';

import { ResolverContext } from '../../context';
import { isRejection } from '../../models/Rejection';
import { ChangeProposalsStatusInput } from './ChangeProposalsStatusMutation';

@Resolver()
export class ChangeXpressProposalsStatusMutation {
  @Mutation(() => Boolean)
  async changeXpressProposalsStatus(
    @Arg('changeProposalsStatusInput')
    changeProposalsStatusInput: ChangeProposalsStatusInput,
    @Ctx() context: ResolverContext
  ) {
    const result = await context.mutations.proposal.changeXpressProposalsStatus(
      context.user,
      changeProposalsStatusInput
    );

    return isRejection(result) ? result : true;
  }
}
