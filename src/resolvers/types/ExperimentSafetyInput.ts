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
import { ExperimentSafetyInput as ExperimentSafetyInputOrigin } from '../../models/ExperimentSafetyInput';
import { Questionary } from './Questionary';
import { SampleExperimentSafetyInput } from './SampleExperimentSafetyInput';
import { Visit } from './Visit';

@ObjectType()
export class ExperimentSafetyInput
  implements Partial<ExperimentSafetyInputOrigin>
{
  @Field(() => Int)
  public id: number;

  @Field(() => Int)
  public visitId: number;

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

  @FieldResolver(() => Visit, { nullable: true })
  async visit(
    @Root() esi: ExperimentSafetyInput,
    @Ctx() context: ResolverContext
  ): Promise<Visit | null> {
    return context.queries.visit.getVisit(context.user, esi.visitId);
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
}
