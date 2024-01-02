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
export class UpdatePdfTemplateArgs {
  @Field(() => Int)
  pdfTemplateId: number;

  @Field(() => String, { nullable: true })
  templateData?: string;

  @Field(() => String, { nullable: true })
  templateHeader?: string;

  @Field(() => String, { nullable: true })
  templateFooter?: string;

  @Field(() => String, { nullable: true })
  templateSampleDeclaration?: string;

  @Field(() => String, { nullable: true })
  dummyData?: string;
}

@Resolver()
export class UpdatePdfTemplateMutation {
  @Mutation(() => PdfTemplate)
  updatePdfTemplate(
    @Args() args: UpdatePdfTemplateArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.pdfTemplate.updatePdfTemplate(context.user, args);
  }
}
