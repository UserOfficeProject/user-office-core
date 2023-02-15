import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { PdfTemplate } from '../types/PdfTemplate';

@Resolver()
export class DeletePdfTemplateMutation {
  @Mutation(() => PdfTemplate)
  deletePdfTemplate(
    @Arg('pdfTemplateId', () => Int) pdfTemplateId: number,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.pdfTemplate.deletePdfTemplate(
      context.user,
      pdfTemplateId
    );
  }
}
