import { Sample as SampleOrigin, SampleStatus } from '../../models/Sample';
import { ObjectType, Field, Int } from 'type-graphql';
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
