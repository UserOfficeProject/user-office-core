import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { ExperimentSafetyPdfTemplate } from '../types/ExperimentSafetyPdfTemplate';

@Resolver()
export class DeleteExperimentSafetyPdfTemplateMutation {
  @Mutation(() => ExperimentSafetyPdfTemplate)
  deleteExperimentSafetyPdfTemplate(
    @Arg('experimentSafetyPdfTemplateId', () => Int)
    experimentSafetyPdfTemplateId: number,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.experimentSafetyPdfTemplate.deleteExperimentSafetyPdfTemplate(
      context.user,
      experimentSafetyPdfTemplateId
    );
  }
}
