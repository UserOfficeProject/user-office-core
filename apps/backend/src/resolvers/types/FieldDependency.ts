import { ObjectType, Field } from 'type-graphql';

import { FieldCondition } from './FieldCondition';
import { FieldDependency as FieldDependencyOrigin } from '../../models/Template';

@ObjectType()
export class FieldDependency implements Partial<FieldDependencyOrigin> {
  @Field()
  public questionId: string;

  @Field()
  public dependencyId: string;

  @Field()
  public dependencyNaturalKey: string;

  @Field(() => FieldCondition)
  public condition: FieldCondition;
}
