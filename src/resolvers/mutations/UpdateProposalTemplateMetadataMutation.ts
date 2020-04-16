import { Args, ArgsType, Ctx, Field, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { ProposalTemplateMetadataResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@ArgsType()
export class UpdateProposalTemplateMetadataArgs {
  @Field()
  public templateId: number;

  @Field({ nullable: true })
  public name: string;

  @Field({ nullable: true })
  public description: string;

  @Field({ nullable: true })
  public isArchived: boolean;
}

@Resolver()
export class UpdateProposalTemplateMetadataMutation {
  @Mutation(() => ProposalTemplateMetadataResponseWrap)
  updateProposalTemplateMetadata(
    @Args() args: UpdateProposalTemplateMetadataArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.template.updateProposalTemplateMetadata(
        context.user,
        args
      ),
      ProposalTemplateMetadataResponseWrap
    );
  }
}
