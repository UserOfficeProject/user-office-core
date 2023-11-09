import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { UnitDataSource } from '../datasources/UnitDataSource';
import { Authorized } from '../decorators';
import { rejection } from '../models/Rejection';
import { Roles } from '../models/Role';
import { Unit } from '../models/Unit';
import { UserWithRole } from '../models/User';
import { CreateUnitArgs } from '../resolvers/mutations/CreateUnitMutation';
import { ImportUnitsArgs } from '../resolvers/mutations/ImportUnitsMutation';
import { isSiConversionFormulaValid } from '../utils/isSiConversionFormulaValid';

@injectable()
export default class UnitMutations {
  constructor(
    @inject(Tokens.UnitDataSource) private unitDataSource: UnitDataSource
  ) {}

  @Authorized([Roles.USER_OFFICER])
  async createUnit(agent: UserWithRole | null, args: CreateUnitArgs) {
    if (isSiConversionFormulaValid(args.siConversionFormula) === false) {
      return rejection('The SI conversion formula is not valid', { args });
    }

    return await this.unitDataSource.createUnit(args);
  }

  @Authorized([Roles.USER_OFFICER])
  async deleteUnit(agent: UserWithRole | null, id: string) {
    return await this.unitDataSource.deleteUnit(id);
  }

  @Authorized([Roles.USER_OFFICER])
  async validateUnitsImport(agent: UserWithRole | null, unitsAsJson: string) {
    return this.unitDataSource.validateUnitsImport(unitsAsJson);
  }

  @Authorized([Roles.USER_OFFICER])
  async importUnits(
    user: UserWithRole | null,
    args: ImportUnitsArgs
  ): Promise<Unit[]> {
    return this.unitDataSource.importUnits(args);
  }
}
