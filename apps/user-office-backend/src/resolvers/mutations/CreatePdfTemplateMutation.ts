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
import { PdfTemplate } from '../types/PdfTemplate';

@ArgsType()
export class CreatePdfTemplateInput {
  @Field(() => Int)
  templateId: number;

  @Field(() => String)
  templateData: string;

  @Field(() => String)
  templateHeader: string;

  @Field(() => String)
  templateFooter: string;

  @Field(() => String)
  templateSampleDeclaration: string;
}

@Resolver()
export class CreatePdfTemplateMutation {
  @Mutation(() => PdfTemplate)
  createPdfTemplate(
    @Args() input: CreatePdfTemplateInput,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.pdfTemplate.createPdfTemplate(context.user, input);
  }
}
