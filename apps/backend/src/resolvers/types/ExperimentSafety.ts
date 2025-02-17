import { GraphQLError } from 'graphql';
import { container } from 'tsyringe';
import {
  Ctx,
  Directive,
  Field,
  FieldResolver,
  ObjectType,
  Resolver,
  Root,
} from 'type-graphql';

import { Tokens } from '../../config/Tokens';
import { ResolverContext } from '../../context';
import { ExperimentDataSource } from '../../datasources/ExperimentDataSource';
import { ExperimentSafety as ExperimentSafetyOrigin } from '../../models/Experiment';
import { Proposal } from './Proposal';
import { Questionary } from './Questionary';
import { SampleExperimentSafetyInput } from './SampleExperimentSafetyInput';

@ObjectType()
@Directive('@key(fields: "experimentSafetyPk")')
export class ExperimentSafety implements ExperimentSafetyOrigin {
  @Field(() => Number)
  public experimentSafetyPk: number;

  @Field(() => Number)
  public experimentPk: number;

  @Field(() => Number)
  public esiQuestionaryId: number;

  @Field(() => Number)
  public createdBy: number;

  @Field(() => String)
  public status: string;

  @Field(() => Number)
  public safetyReviewQuestionaryId: number;

  @Field(() => Number, { nullable: true })
  public reviewedBy: number | null;

  @Field(() => Date)
  public createdAt: Date;

  @Field(() => Date)
  public updatedAt: Date;
}

@Resolver(() => ExperimentSafety)
export class ExperimentSafetyResolver {
  @FieldResolver(() => [SampleExperimentSafetyInput])
  async sampleEsis(
    @Root() experimentSafety: ExperimentSafety,
    @Ctx() context: ResolverContext
  ): Promise<SampleExperimentSafetyInput[]> {
    return context.queries.sampleEsi.getSampleEsis(context.user, {
      esiId: experimentSafety.experimentSafetyPk,
    });
  }

  @FieldResolver(() => Questionary)
  async questionary(
    @Root() experimentSafety: ExperimentSafety,
    @Ctx() context: ResolverContext
  ): Promise<Questionary> {
    return context.queries.proposalEsi.getQuestionary(
      context.user,
      experimentSafety.esiQuestionaryId
    );
  }

  @FieldResolver(() => Proposal)
  async proposal(
    @Root() experimentSafety: ExperimentSafety,
    @Ctx() context: ResolverContext
  ): Promise<Proposal> {
    const experimentDataSource = container.resolve<ExperimentDataSource>(
      Tokens.ExperimentDataSource
    );
    const experiment = await experimentDataSource.getExperiment(
      experimentSafety.experimentPk
    );
    if (experiment === null || experiment.proposalPk === null) {
      throw new GraphQLError(
        'Unexpected error. Scheduled event must have an associated proposal'
      );
    }

    const proposal = await context.queries.proposal.get(
      context.user,
      experiment.proposalPk
    );

    if (proposal === null) {
      throw new GraphQLError(
        'Unexpected error. Scheduled event proposal does not exist'
      );
    }

    return proposal;
  }
}
