import { Field, InputType } from 'type-graphql';

import { ConflictResolutionStrategy } from '../../models/Template';

@InputType()
export class ConflictResolution {
  @Field(() => String)
  itemId: string;

  @Field(() => ConflictResolutionStrategy)
  strategy: ConflictResolutionStrategy;
}
