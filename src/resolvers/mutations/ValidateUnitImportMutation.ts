import { Arg, Ctx, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { UnitsImportWithValidationWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@Resolver()
export class ValidateUnitsImportMutation {
  @Mutation(() => UnitsImportWithValidationWrap)
  validateUnitsImport(
    @Arg('unitsAsJson')
    unitsAsJson: string,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.unit.validateUnitsImport(context.user, unitsAsJson),
      UnitsImportWithValidationWrap
    );
  }
}
