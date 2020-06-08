import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { TemplateResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@Resolver()
export class CloneProposalTemplateMutation {
  @Mutation(() => TemplateResponseWrap)
  cloneProposalTemplate(
    @Arg('templateId', () => Int) templateId: number,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.template.cloneTemplate(context.user, templateId),
      TemplateResponseWrap
    );
  }
}
