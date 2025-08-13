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
import {
  ExperimentSafety as ExperimentSafetyOrigin,
  ExperimentSafetyReviewerDecisionEnum,
  InstrumentScientistDecisionEnum,
} from '../../models/Experiment';
import { TemplateCategoryId } from '../../models/Template';
import { ExperimentHasSample } from './ExperimentHasSample';
import { Proposal } from './Proposal';
import { Questionary } from './Questionary';
import { Status } from './Status';

@ObjectType()
@Directive('@key(fields: "experimentSafetyPk")')
export class ExperimentSafety implements ExperimentSafetyOrigin {
  @Field(() => Number)
  public experimentSafetyPk: number;

  @Field(() => Number)
  public experimentPk: number;

  @Field(() => Number)
  public esiQuestionaryId: number;

  @Field(() => Date, { nullable: true })
  public esiQuestionarySubmittedAt: Date | null;

  @Field(() => Number)
  public createdBy: number;

  @Field(() => Number, { nullable: true })
  public statusId: number | null;

  @Field(() => Number, { nullable: true })
  public safetyReviewQuestionaryId: number | null;

  @Field(() => Number, { nullable: true })
  public reviewedBy: number | null;

  @Field(() => Date)
  public createdAt: Date;

  @Field(() => Date)
  public updatedAt: Date;

  @Field(() => InstrumentScientistDecisionEnum, { nullable: true })
  public instrumentScientistDecision: InstrumentScientistDecisionEnum | null;

  @Field(() => String, { nullable: true })
  public instrumentScientistComment: string | null;

  @Field(() => ExperimentSafetyReviewerDecisionEnum, { nullable: true })
  public experimentSafetyReviewerDecision: ExperimentSafetyReviewerDecisionEnum | null;

  @Field(() => String, { nullable: true })
  public experimentSafetyReviewerComment: string | null;
}

@Resolver(() => ExperimentSafety)
export class ExperimentSafetyResolver {
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

  @FieldResolver(() => Questionary)
  async questionary(
    @Root() experimentSafety: ExperimentSafety,
    @Ctx() context: ResolverContext
  ): Promise<Questionary> {
    const questionary = await context.queries.questionary.getQuestionary(
      context.user,
      experimentSafety.esiQuestionaryId
    );

    if (questionary === null) {
      throw new GraphQLError(
        'Unexpected error. Experiment safety questionary does not exist'
      );
    }

    return questionary;
  }

  @FieldResolver(() => Questionary)
  async safetyReviewQuestionary(
    @Root() experimentSafety: ExperimentSafety,
    @Ctx() context: ResolverContext
  ): Promise<Questionary> {
    const questionary =
      await context.queries.questionary.getQuestionaryOrDefault(
        context.user,
        experimentSafety.safetyReviewQuestionaryId ?? 0,
        TemplateCategoryId.EXPERIMENT_SAFETY_REVIEW
      );

    return questionary;
  }

  @FieldResolver(() => [ExperimentHasSample])
  async samples(
    @Root() experimentSafety: ExperimentSafety,
    @Ctx() context: ResolverContext
  ): Promise<ExperimentHasSample[]> {
    return context.queries.experiment.getExperimentSamples(
      context.user,
      experimentSafety.experimentPk
    );
  }

  @FieldResolver(() => Status, { nullable: true })
  async status(
    @Root() experimentSafety: ExperimentSafety,
    @Ctx() context: ResolverContext
  ): Promise<Status | null> {
    if (experimentSafety.statusId === null) {
      return null;
    }

    const status = await context.queries.status.getStatus(
      context.user,
      experimentSafety.statusId
    );

    if (status === null) {
      throw new GraphQLError(
        'Unexpected error. Experiment safety status does not exist'
      );
    }

    return status;
  }
}
