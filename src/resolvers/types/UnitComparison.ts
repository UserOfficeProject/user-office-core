import { ObjectType, Field } from 'type-graphql';

import {
  ComparisonStatus,
  ConflictResolutionStrategy,
} from '../../models/Template';
import { UnitComparison as UnitComparisonOrigin } from '../../models/Unit';
import { Unit } from './Unit';

@ObjectType()
export class UnitComparison implements Partial<UnitComparisonOrigin> {
  @Field(() => Unit, { nullable: true })
  public existingUnit: Unit | null;

  @Field(() => Unit)
  public newUnit: Unit;

  @Field(() => ComparisonStatus)
  public status: ComparisonStatus;

  @Field(() => ConflictResolutionStrategy)
  public conflictResolutionStrategy: ConflictResolutionStrategy;
}
