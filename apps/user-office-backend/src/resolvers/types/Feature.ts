import { Field, ObjectType } from 'type-graphql';

import { Feature as FeatureOrigin, FeatureId } from '../../models/Feature';
@ObjectType()
export class Feature implements Partial<FeatureOrigin> {
  @Field(() => FeatureId)
  public id: FeatureId;

  @Field()
  public isEnabled: boolean;

  @Field()
  public description: string;
}
