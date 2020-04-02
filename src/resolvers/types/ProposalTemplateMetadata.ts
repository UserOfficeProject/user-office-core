import { Field, Int, ObjectType } from 'type-graphql';

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
