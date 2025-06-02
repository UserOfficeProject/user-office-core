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
export class CreateExperimentSafetyPdfTemplateInput {
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

  @Field(() => String)
  dummyData: string;
}

@Resolver()
export class CreateExperimentSafetyPdfTemplateMutation {
  @Mutation(() => ExperimentSafetyPdfTemplate)
  createExperimentSafetyPdfTemplate(
    @Args() input: CreateExperimentSafetyPdfTemplateInput,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.experimentSafetyPdfTemplate.createExperimentSafetyPdfTemplate(
      context.user,
      input
    );
  }
}
