import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { PdfTemplateResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@Resolver()
export class DeletePdfTemplateMutation {
  @Mutation(() => PdfTemplateResponseWrap)
  deletePdfTemplate(
    @Arg('pdfTemplateId', () => Int) pdfTemplateId: number,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.pdfTemplate.deletePdfTemplate(
        context.user,
        pdfTemplateId
      ),
      PdfTemplateResponseWrap
    );
  }
}
