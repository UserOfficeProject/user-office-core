import { Field, Int, ObjectType } from 'type-graphql';

import { ExperimentSafetyPdfTemplate as ExperimentSafetyPdfTemplateOrigin } from '../../models/ExperimentSafetyPdfTemplate';

@ObjectType()
export class ExperimentSafetyPdfTemplate
  implements Partial<ExperimentSafetyPdfTemplateOrigin>
{
  @Field(() => Int)
  public experimentSafetyPdfTemplateId: number;

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
