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
import { ExperimentSafetyPdfTemplate } from '../types/ExperimentSafetyPdfTemplate';

@InputType()
class ExperimentSafetyPdfTemplatesFilter {
  @Field(() => [Int], { nullable: true })
  public experimentSafetyPdfTemplateIds?: number[];

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
export class ExperimentSafetyPdfTemplatesArgs {
  @Field(() => ExperimentSafetyPdfTemplatesFilter, { nullable: true })
  public filter?: ExperimentSafetyPdfTemplatesFilter;
}

@Resolver()
export class ExperimentSafetyPdfTemplatesQuery {
  @Query(() => [ExperimentSafetyPdfTemplate], { nullable: true })
  async experimentSafetyPdfTemplates(
    @Ctx() context: ResolverContext,
    @Args() args: ExperimentSafetyPdfTemplatesArgs
  ) {
    const response =
      await context.queries.experimentSafetyPdfTemplate.getExperimentSafetyPdfTemplates(
        context.user,
        args
      );

    return response;
  }
}
