import {
  ObjectType,
  Field,
  Int,
  Resolver,
  FieldResolver,
  Root,
  Ctx,
} from 'type-graphql';

import { Sample as SampleOrigin, SampleStatus } from '../../models/Sample';
import { Questionary } from './Questionary';
import { ResolverContext } from '../../context';
@ObjectType()
export class Sample implements Partial<SampleOrigin> {
  @Field(() => Int)
  public id: number;

  @Field()
  public title: string;

  @Field(() => Int)
  public creatorId: number;

  @Field(() => Int)
  public questionaryId: number;

  @Field(() => SampleStatus)
  public status: SampleStatus;

  @Field(() => Date)
  public created: Date;
}

@Resolver(() => Sample)
export class SampleResolver {
  @FieldResolver(() => Questionary)
  async questionary(
    @Root() sample: Sample,
    @Ctx() context: ResolverContext
  ): Promise<Questionary | null> {
    return context.queries.questionary.getQuestionary(
      context.user,
      sample.questionaryId
    );
  }
}
