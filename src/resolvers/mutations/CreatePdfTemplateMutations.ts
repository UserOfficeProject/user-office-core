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
export class CreatePdfTemplateInput {
  @Field(() => Int)
  templateId: number;

  @Field(() => String)
  templateData: string;
}

@Resolver()
export class CreatePdfTemplateMutation {
  @Mutation(() => PdfTemplateResponseWrap)
  createPdfTemplate(
    @Args() input: CreatePdfTemplateInput,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.pdfTemplate.createPdfTemplate(context.user, input),
      PdfTemplateResponseWrap
    );
  }
}
