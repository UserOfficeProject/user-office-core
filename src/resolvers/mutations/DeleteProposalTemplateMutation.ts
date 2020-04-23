import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { ProposalTemplateMetadataResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@Resolver()
export class DeleteProposalTemplateMutation {
  @Mutation(() => ProposalTemplateMetadataResponseWrap)
  deleteProposalTemplate(
    @Arg('id', () => Int) id: number,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.template.deleteTemplate(context.user, id),
      ProposalTemplateMetadataResponseWrap
    );
  }
}
