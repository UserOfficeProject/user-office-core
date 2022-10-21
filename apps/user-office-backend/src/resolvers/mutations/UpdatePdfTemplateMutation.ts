import {
  Args,
  ArgsType,
  Ctx,
  Field,
  Int,
  Mutation,
  Resolver,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { PdfTemplateResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@ArgsType()
export class UpdatePdfTemplateArgs {
  @Field(() => Int)
  pdfTemplateId: number;

  @Field(() => String, { nullable: true })
  templateData?: string;
}

@Resolver()
export class UpdatePdfTemplateMutation {
  @Mutation(() => PdfTemplateResponseWrap)
  updatePdfTemplate(
    @Args() args: UpdatePdfTemplateArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.pdfTemplate.updatePdfTemplate(context.user, args),
      PdfTemplateResponseWrap
    );
  }
}
