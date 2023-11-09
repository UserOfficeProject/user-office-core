import { Arg, Ctx, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { UnitsImportWithValidation } from '../types/UnitsImportWithValidation';

@Resolver()
export class ValidateUnitsImportMutation {
  @Mutation(() => UnitsImportWithValidation)
  validateUnitsImport(
    @Arg('unitsAsJson')
    unitsAsJson: string,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.unit.validateUnitsImport(
      context.user,
      unitsAsJson
    );
  }
}
