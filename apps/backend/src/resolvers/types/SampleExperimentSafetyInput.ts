import {
  Ctx,
  Field,
  FieldResolver,
  Int,
  ObjectType,
  Resolver,
  Root,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { SampleExperimentSafetyInput as SampleExperimentSafetyInputOrigin } from '../../models/SampleExperimentSafetyInput';
import { Questionary } from './Questionary';
import { Sample } from './Sample';

@ObjectType()
export class SampleExperimentSafetyInput
  implements Partial<SampleExperimentSafetyInputOrigin>
{
  @Field(() => Int)
  public esiId: number;

  @Field(() => Int)
  public sampleId: number;

  @Field(() => Int)
  public questionaryId: number;

  @Field(() => Boolean)
  public isSubmitted: boolean;
}

@Resolver(() => SampleExperimentSafetyInput)
export class SampleExperimentSafetyInputResolver {
  @FieldResolver(() => Questionary)
  async questionary(
    @Root() sampleEsi: SampleExperimentSafetyInput,
    @Ctx() context: ResolverContext
  ): Promise<Questionary> {
    return context.queries.sampleEsi.getQuestionary(
      context.user,
      sampleEsi.questionaryId
    );
  }

  @FieldResolver(() => Sample)
  async sample(
    @Root() sampleEsi: SampleExperimentSafetyInput,
    @Ctx() context: ResolverContext
  ): Promise<Sample | null> {
    return context.queries.sample.getSample(context.user, sampleEsi.sampleId);
  }
}
