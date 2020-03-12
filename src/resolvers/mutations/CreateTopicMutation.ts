import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { ProposalTemplateResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@Resolver()
export class CreateTopicMutation {
  @Mutation(() => ProposalTemplateResponseWrap)
  createTopic(
    @Arg('sortOrder', () => Int) sortOrder: number,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.template.createTopic(context.user, sortOrder),
      ProposalTemplateResponseWrap
    );
  }
}
