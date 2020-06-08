import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { ProposalTemplateResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@Resolver()
export class CloneProposalTemplateMutation {
  @Mutation(() => ProposalTemplateResponseWrap)
  cloneProposalTemplate(
    @Arg('templateId', () => Int) templateId: number,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.template.cloneTemplate(context.user, { templateId }),
      ProposalTemplateResponseWrap
    );
  }
}
