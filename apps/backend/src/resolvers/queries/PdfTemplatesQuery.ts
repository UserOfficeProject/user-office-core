import {
  Args,
  ArgsType,
  Ctx,
  Field,
  InputType,
  Int,
  Query,
  Resolver,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { PdfTemplate } from '../types/PdfTemplate';

@InputType()
class PdfTemplatesFilter {
  @Field(() => [Int], { nullable: true })
  public pdfTemplateIds?: number[];

  @Field(() => [Int], { nullable: true })
  public templateIds?: number[];

  @Field(() => String, { nullable: true })
  public pdfTemplateData?: string;

  @Field(() => String, { nullable: true })
  public pdfTemplateHeader?: string;

  @Field(() => String, { nullable: true })
  public pdfTemplateFooter?: string;

  @Field(() => String, { nullable: true })
  public pdfTemplateSampleDeclaration?: string;

  @Field(() => String, { nullable: true })
  public dummyData?: string;

  @Field(() => Int, { nullable: true })
  public creatorId?: number;
}

@ArgsType()
export class PdfTemplatesArgs {
  @Field(() => PdfTemplatesFilter, { nullable: true })
  public filter?: PdfTemplatesFilter;
}

@Resolver()
export class PdfTemplatesQuery {
  @Query(() => [PdfTemplate], { nullable: true })
  async pdfTemplates(
    @Ctx() context: ResolverContext,
    @Args() args: PdfTemplatesArgs
  ) {
    const response = await context.queries.pdfTemplate.getPdfTemplates(
      context.user,
      args
    );

    return response;
  }
}
