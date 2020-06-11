import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { ProposalTemplateResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@Resolver()
export class DeleteProposalTemplateMutation {
  @Mutation(() => ProposalTemplateResponseWrap)
  deleteProposalTemplate(
    @Arg('id', () => Int) id: number,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.template.deleteTemplate(context.user, {
        templateId: id,
      }),
      ProposalTemplateResponseWrap
    );
  }
}
