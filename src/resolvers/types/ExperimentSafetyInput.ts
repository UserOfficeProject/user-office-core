import { container } from 'tsyringe';
import {
  Ctx,
  Field,
  FieldResolver,
  Int,
  ObjectType,
  Resolver,
  Root,
} from 'type-graphql';

import { Tokens } from '../../config/Tokens';
import { ResolverContext } from '../../context';
import ScheduledEventDataSource from '../../datasources/postgres/ScheduledEventDataSource';
import { ExperimentSafetyInput as ExperimentSafetyInputOrigin } from '../../models/ExperimentSafetyInput';
import { Proposal } from './Proposal';
import { Questionary } from './Questionary';
import { SampleExperimentSafetyInput } from './SampleExperimentSafetyInput';

@ObjectType()
export class ExperimentSafetyInput
  implements Partial<ExperimentSafetyInputOrigin>
{
  @Field(() => Int)
  public id: number;

  @Field(() => Int)
  public scheduledEventId: number;

  @Field(() => Int)
  public creatorId: number;

  @Field(() => Int)
  public questionaryId: number;

  @Field(() => Boolean)
  public isSubmitted: boolean;

  @Field(() => Date)
  public created: Date;
}

@Resolver(() => ExperimentSafetyInput)
export class ExperimentSafetyInputResolver {
  @FieldResolver(() => [SampleExperimentSafetyInput])
  async sampleEsis(
    @Root() esi: ExperimentSafetyInput,
    @Ctx() context: ResolverContext
  ): Promise<SampleExperimentSafetyInput[]> {
    return context.queries.sampleEsi.getSampleEsis(context.user, {
      esiId: esi.id,
    });
  }

  @FieldResolver(() => Questionary)
  async questionary(
    @Root() esi: ExperimentSafetyInput,
    @Ctx() context: ResolverContext
  ): Promise<Questionary> {
    return context.queries.proposalEsi.getQuestionary(
      context.user,
      esi.questionaryId
    );
  }

  @FieldResolver(() => Proposal)
  async proposal(
    @Root() esi: ExperimentSafetyInput,
    @Ctx() context: ResolverContext
  ): Promise<Proposal> {
    const scheduledEventDataSource =
      container.resolve<ScheduledEventDataSource>(
        Tokens.ScheduledEventDataSource
      );
    const scheduledEvent = await scheduledEventDataSource.getScheduledEventCore(
      esi.scheduledEventId
    );
    if (scheduledEvent === null || scheduledEvent.proposalPk === null) {
      throw new Error(
        'Unexpected error. Scheduled event must have an associated proposal'
      );
    }

    const proposal = await context.queries.proposal.get(
      context.user,
      scheduledEvent.proposalPk
    );

    if (proposal === null) {
      throw new Error(
        'Unexpected error. Scheduled event proposal does not exist'
      );
    }

    return proposal;
  }
}
