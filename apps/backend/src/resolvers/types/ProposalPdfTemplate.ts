import { Field, Int, ObjectType } from 'type-graphql';

import { ProposalPdfTemplate as ProposalPdfTemplateOrigin } from '../../models/ProposalPdfTemplate';

@ObjectType()
export class ProposalPdfTemplate implements Partial<ProposalPdfTemplateOrigin> {
  @Field(() => Int)
  public proposalPdfTemplateId: number;

  @Field(() => Int)
  public templateId: number;

  @Field()
  public templateData: string;

  @Field()
  public templateHeader: string;

  @Field()
  public templateFooter: string;

  @Field()
  public templateSampleDeclaration: string;

  @Field()
  public dummyData: string;

  @Field(() => Int)
  public creatorId: number;

  @Field(() => Date)
  public created: Date;
}
