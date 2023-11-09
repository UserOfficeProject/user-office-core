import { Arg, Ctx, Query, Resolver, Int } from 'type-graphql';

import { ResolverContext } from '../../context';
import { PdfTemplate } from '../types/PdfTemplate';

@Resolver()
export class PdfTemplateQuery {
  @Query(() => PdfTemplate, { nullable: true })
  pdfTemplate(
    @Ctx() context: ResolverContext,
    @Arg('pdfTemplateId', () => Int) pdfTemplateId: number
  ) {
    return context.queries.pdfTemplate.getPdfTemplate(
      context.user,
      pdfTemplateId
    );
  }
}
