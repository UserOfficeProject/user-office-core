import { Arg, Ctx, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { ProposalTemplateResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@Resolver()
export class CreateProposalTemplateMutation {
  @Mutation(() => ProposalTemplateResponseWrap)
  createProposalTemplate(
    @Ctx() context: ResolverContext,
    @Arg('name', () => String) name: string,
    @Arg('description', () => String, { nullable: true }) description?: string
  ) {
    return wrapResponse(
      context.mutations.template.createTemplate(context.user, {
        name,
        description,
      }),
      ProposalTemplateResponseWrap
    );
  }
}
