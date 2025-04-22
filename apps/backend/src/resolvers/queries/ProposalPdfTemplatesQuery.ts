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
import { ProposalPdfTemplate } from '../types/ProposalPdfTemplate';

@InputType()
class ProposalPdfTemplatesFilter {
  @Field(() => [Int], { nullable: true })
  public proposalPdfTemplateIds?: number[];

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
export class ProposalPdfTemplatesArgs {
  @Field(() => ProposalPdfTemplatesFilter, { nullable: true })
  public filter?: ProposalPdfTemplatesFilter;
}

@Resolver()
export class ProposalPdfTemplatesQuery {
  @Query(() => [ProposalPdfTemplate], { nullable: true })
  async proposalPdfTemplates(
    @Ctx() context: ResolverContext,
    @Args() args: ProposalPdfTemplatesArgs
  ) {
    const response = await context.queries.proposalPdfTemplate.getPdfTemplates(
      context.user,
      args
    );

    return response;
  }
}
