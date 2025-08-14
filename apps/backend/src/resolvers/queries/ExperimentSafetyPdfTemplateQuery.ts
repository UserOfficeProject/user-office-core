import { Arg, Ctx, Query, Resolver, Int } from 'type-graphql';

import { ResolverContext } from '../../context';
import { ExperimentSafetyPdfTemplate } from '../types/ExperimentSafetyPdfTemplate';

@Resolver()
export class ExperimentSafetyPdfTemplateQuery {
  @Query(() => ExperimentSafetyPdfTemplate, { nullable: true })
  experimentSafetyPdfTemplate(
    @Ctx() context: ResolverContext,
    @Arg('experimentSafetyPdfTemplateId', () => Int)
    experimentSafetyPdfTemplateId: number
  ) {
    return context.queries.experimentSafetyPdfTemplate.getExperimentSafetyPdfTemplate(
      context.user,
      experimentSafetyPdfTemplateId
    );
  }
}
