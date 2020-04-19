import { Arg, Ctx, Mutation, Resolver, Int } from 'type-graphql';

import { ResolverContext } from '../../context';
import { ProposalTemplateResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@Resolver()
export class DeleteQuestionRelMutation {
  @Mutation(() => ProposalTemplateResponseWrap)
  deleteQuestionRel(
    @Arg('templateId', () => Int) templateId: number,
    @Arg('questionId', () => String) questionId: string,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.template.deleteQuestionRel(
        context.user,
        templateId,
        questionId
      ),
      ProposalTemplateResponseWrap
    );
  }
}
