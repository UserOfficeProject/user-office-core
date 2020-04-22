import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';
import { ResolverContext } from '../../context';
import { ProposalTemplateResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@Resolver()
export class DeleteTopicMutation {
  @Mutation(() => ProposalTemplateResponseWrap)
  deleteTopic(
    @Arg('topicId', () => Int) topicId: number,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.proposalAdmin.deleteTopic(context.user, topicId),
      ProposalTemplateResponseWrap
    );
  }
}
