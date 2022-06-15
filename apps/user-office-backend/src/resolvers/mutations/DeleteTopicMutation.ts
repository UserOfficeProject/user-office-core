import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { TemplateResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@Resolver()
export class DeleteTopicMutation {
  @Mutation(() => TemplateResponseWrap)
  deleteTopic(
    @Arg('topicId', () => Int) topicId: number,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.template.deleteTopic(context.user, { topicId }),
      TemplateResponseWrap
    );
  }
}
