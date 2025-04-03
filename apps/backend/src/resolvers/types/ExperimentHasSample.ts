import { GraphQLError } from 'graphql';
import {
  Ctx,
  Field,
  FieldResolver,
  ObjectType,
  Resolver,
  Root,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { ExperimentHasSample as ExperimentHasSampleOrigin } from '../../models/Experiment';
import { Questionary } from './Questionary';
import { Sample } from './Sample';

@ObjectType()
export class ExperimentHasSample implements ExperimentHasSampleOrigin {
  @Field(() => Number)
  public experimentPk: number;

  @Field(() => Number)
  public sampleId: number;

  @Field(() => Boolean)
  public isEsiSubmitted: boolean;

  @Field(() => Number)
  public sampleEsiQuestionaryId: number;

  @Field(() => Date)
  public createdAt: Date;

  @Field(() => Date)
  public updatedAt: Date;
}

@Resolver(() => ExperimentHasSample)
export class ExperimentHasSampleResolver {
  @FieldResolver(() => Questionary)
  async questionary(
    @Root() experimentHasSample: ExperimentHasSample,
    @Ctx() context: ResolverContext
  ): Promise<Questionary> {
    const questionary = await context.queries.questionary.getQuestionary(
      context.user,
      experimentHasSample.sampleEsiQuestionaryId
    );

    if (!questionary) {
      throw new GraphQLError(
        'Unexpected error. Experiment safety questionary does not exist'
      );
    }

    return questionary;
  }

  @FieldResolver(() => Sample)
  async sample(
    @Root() experimentHasSample: ExperimentHasSample,
    @Ctx() context: ResolverContext
  ): Promise<Sample | null> {
    return context.queries.sample.getSample(
      context.user,
      experimentHasSample.sampleId
    );
  }
}
