import { GraphQLError } from 'graphql';
import {
  Ctx,
  Directive,
  Field,
  FieldResolver,
  ObjectType,
  Resolver,
  Root,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { Experiment as ExperimentOrigin } from '../../models/Experiment';
import { BasicUserDetails } from './BasicUserDetails';
import { ExperimentSafety } from './ExperimentSafety';
import { Feedback } from './Feedback';
import { Instrument } from './Instrument';
import { Proposal } from './Proposal';
import { Visit } from './Visit';

@ObjectType()
@Directive('@key(fields: "experimentPk")')
export class Experiment implements ExperimentOrigin {
  @Field(() => Number)
  public experimentPk: number;

  @Field(() => String)
  public experimentId: string;

  @Field(() => Date)
  public startsAt: Date;

  @Field(() => Date)
  public endsAt: Date;

  @Field(() => Number)
  public scheduledEventId: number;

  @Field(() => Number)
  public proposalPk: number;

  @Field(() => String)
  public status: string;

  @Field(() => Number, { nullable: true })
  public localContactId: number | null;

  @Field(() => Number)
  public instrumentId: number;

  @Field(() => Date)
  public createdAt: Date;

  @Field(() => Date)
  public updatedAt: Date;
}

@Resolver(() => Experiment)
export class ExperimentResolver {
  @FieldResolver(() => BasicUserDetails, { nullable: true })
  async localContact(
    @Root() experiment: Experiment,
    @Ctx() context: ResolverContext
  ): Promise<BasicUserDetails | null> {
    return experiment.localContactId
      ? context.queries.user.getBasic(context.user, experiment.localContactId)
      : null;
  }

  @FieldResolver(() => Instrument)
  async instrument(
    @Root() experiment: Experiment,
    @Ctx() context: ResolverContext
  ): Promise<Instrument> {
    const instrument = await context.queries.instrument.get(
      context.user,
      experiment.instrumentId
    );

    if (!instrument) {
      throw new GraphQLError('Unexpected error. Instrument not found');
    }

    return instrument;
  }

  @FieldResolver(() => Proposal)
  async proposal(
    @Root() experiment: Experiment,
    @Ctx() context: ResolverContext
  ): Promise<Proposal> {
    const proposal = await context.queries.proposal.get(
      context.user,
      experiment.proposalPk
    );

    if (!proposal) {
      throw new GraphQLError(
        'Unexpected error. Experiment does not have an associated proposal'
      );
    }

    return proposal;
  }

  @FieldResolver(() => Visit, { nullable: true })
  async visit(
    @Root() experiment: Experiment,
    @Ctx() context: ResolverContext
  ): Promise<Visit | null> {
    return context.queries.visit.getVisitByExperimentPk(
      context.user,
      experiment.experimentPk
    );
  }

  @FieldResolver(() => ExperimentSafety, { nullable: true })
  async safety(
    @Root() experiment: Experiment,
    @Ctx() context: ResolverContext
  ): Promise<ExperimentSafety | null> {
    return context.queries.experiment.getExperimentSafetyByExperimentPk(
      context.user,
      experiment.experimentPk
    );
  }

  @FieldResolver(() => Feedback, { nullable: true })
  async feedback(
    @Root() experiment: Experiment,
    @Ctx() context: ResolverContext
  ): Promise<Feedback | null> {
    return context.queries.feedback.getFeedbackByExperimentPk(
      context.user,
      experiment.experimentPk
    );
  }
}
