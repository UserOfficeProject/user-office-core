import {
  Ctx,
  Field,
  FieldResolver,
  Int,
  ObjectType,
  Resolver,
  Root,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { ProposalTemplateMetadata as ProposalProposalTemplateMetadataOrigin } from '../../models/ProposalModel';

@ObjectType()
export class ProposalTemplateMetadata
  implements Partial<ProposalProposalTemplateMetadataOrigin> {
  @Field(() => Int)
  public templateId: number;

  @Field()
  public name: string;

  @Field(() => String, { nullable: true })
  public description: string;

  @Field()
  public isArchived: boolean;
}

@Resolver(() => ProposalTemplateMetadata)
export class ProposalTemplateMetadataResolver {
  @FieldResolver(() => Int)
  async proposalCount(
    @Root() data: ProposalTemplateMetadata,
    @Ctx() context: ResolverContext
  ): Promise<number> {
    return context.queries.proposal
      .getAll(context.user, { templateIds: [data.templateId] })
      .then(result => result?.totalCount || 0);
  }

  @FieldResolver(() => Int)
  async callCount(
    @Root() data: ProposalTemplateMetadata,
    @Ctx() context: ResolverContext
  ): Promise<number> {
    return context.queries.call
      .getAll(context.user, { templateIds: [data.templateId] })
      .then(result => result?.length || 0);
  }
}
