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
import { ExperimentSafetyPdfTemplate } from '../types/ExperimentSafetyPdfTemplate';

@ArgsType()
export class UpdateExperimentSafetyPdfTemplateArgs {
  @Field(() => Int)
  experimentSafetyPdfTemplateId: number;

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
export class UpdateExperimentSafetyPdfTemplateMutation {
  @Mutation(() => ExperimentSafetyPdfTemplate)
  updateExperimentSafetyPdfTemplate(
    @Args() args: UpdateExperimentSafetyPdfTemplateArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.experimentSafetyPdfTemplate.updateExperimentSafetyPdfTemplate(
      context.user,
      args
    );
  }
}
