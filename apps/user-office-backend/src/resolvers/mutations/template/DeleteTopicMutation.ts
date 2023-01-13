import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../../context';
import { Template } from '../../types/Template';

@Resolver()
export class DeleteTopicMutation {
  @Mutation(() => Template)
  deleteTopic(
    @Arg('topicId', () => Int) topicId: number,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.template.deleteTopic(context.user, { topicId });
  }
}
