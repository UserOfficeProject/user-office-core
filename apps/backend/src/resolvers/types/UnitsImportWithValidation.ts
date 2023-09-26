import { ObjectType, Field } from 'type-graphql';

import { UnitsImportWithValidation as UnitsImportWithValidationOrigin } from '../../models/Unit';
import { UnitComparison } from './UnitComparison';

@ObjectType()
export class UnitsImportWithValidation
  implements Partial<UnitsImportWithValidationOrigin>
{
  @Field(() => String)
  public json: string;

  @Field(() => String)
  public version: string;

  @Field(() => Date)
  public exportDate: Date;

  @Field(() => Boolean)
  public isValid: boolean;

  @Field(() => [String])
  public errors: string[];

  @Field(() => [UnitComparison])
  public unitComparisons: UnitComparison[];
}
