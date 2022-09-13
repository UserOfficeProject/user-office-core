import { Field, Int, ObjectType } from 'type-graphql';

import { PdfTemplate as PdfTemplateOrigin } from '../../models/PdfTemplate';

@ObjectType()
export class PdfTemplate implements Partial<PdfTemplateOrigin> {
  @Field(() => Int)
  public pdfTemplateId: number;

  @Field(() => Int)
  public templateId: number;

  @Field()
  public templateData: string;

  @Field(() => Int)
  public creatorId: number;

  @Field(() => Date)
  public created: Date;
}
