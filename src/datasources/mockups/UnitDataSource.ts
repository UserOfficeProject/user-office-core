import { Quantity } from '../../models/Quantity';
import { Unit, UnitsImportWithValidation } from '../../models/Unit';
import { CreateUnitArgs } from '../../resolvers/mutations/CreateUnitMutation';
import { ImportUnitsArgs } from '../../resolvers/mutations/ImportUnitsMutation';
import { UnitDataSource } from '../UnitDataSource';
export const dummyUnit = new Unit('minute', 'Minute', 'time', 'm', 'x/60');

export class UnitDataSourceMock implements UnitDataSource {
  async createUnit(unit: CreateUnitArgs): Promise<Unit> {
    return dummyUnit;
  }
  async deleteUnit(id: string): Promise<Unit | null> {
    return dummyUnit;
  }
  async getUnits(): Promise<Unit[]> {
    return [dummyUnit];
  }

  async getQuantities(): Promise<Quantity[]> {
    return [];
  }

  async getUnitsAsJson(): Promise<string> {
    const units = await this.getUnits();
    const quantities = await this.getQuantities();

    return JSON.stringify({
      units,
      quantities,
    });
  }
  async validateUnitsImport(
    unitsAsJson: string
  ): Promise<UnitsImportWithValidation> {
    return new UnitsImportWithValidation(
      unitsAsJson,
      '1.0.0',
      new Date(),
      true,
      [],
      []
    );
  }

  async importUnits(args: ImportUnitsArgs): Promise<Unit[]> {
    return [];
  }
}
