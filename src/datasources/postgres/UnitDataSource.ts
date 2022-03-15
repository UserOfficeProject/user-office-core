import { injectable } from 'tsyringe';

import { Quantity } from '../../models/Quantity';
import {
  ComparisonStatus,
  ConflictResolutionStrategy,
} from '../../models/Template';
import {
  Unit,
  UnitComparison,
  UnitsExport,
  UnitsImportWithValidation,
} from '../../models/Unit';
import { CreateUnitArgs } from '../../resolvers/mutations/CreateUnitMutation';
import { ImportUnitsArgs } from '../../resolvers/mutations/ImportUnitsMutation';
import { isSiConversionFormulaValid } from '../../utils/isSiConversionFormulaValid';
import { deepEqual } from '../../utils/json';
import { isAboveVersion, isBelowVersion } from '../../utils/version';
import { UnitDataSource } from '../UnitDataSource';
import database from './database';
import {
  createQuantityObject,
  createUnitObject,
  QuantityRecord,
  UnitRecord,
} from './records';

const EXPORT_VERSION = '1.0.0';
const MIN_SUPPORTED_VERSION = '1.0.0';

@injectable()
export default class PostgresUnitDataSource implements UnitDataSource {
  async createUnit(unit: CreateUnitArgs): Promise<Unit> {
    const [unitRecord]: UnitRecord[] = await database
      .insert({
        unit_id: unit.id,
        unit: unit.unit,
        quantity: unit.quantity,
        symbol: unit.symbol,
        si_conversion_formula: unit.siConversionFormula,
      })
      .into('units')
      .returning('*');

    if (!unitRecord) {
      throw new Error('Could not create unit');
    }

    return createUnitObject(unitRecord);
  }

  async deleteUnit(id: string): Promise<Unit | null> {
    const [unitRecord]: UnitRecord[] = await database('units')
      .where('units.unit_id', id)
      .del()
      .from('units')
      .returning('*');

    if (!unitRecord) {
      return null;
    }

    return createUnitObject(unitRecord);
  }

  async getUnits(): Promise<Unit[]> {
    return await database
      .select()
      .from('units')
      .orderBy('unit', 'asc')
      .then((records: UnitRecord[]) =>
        records.map((unit) => createUnitObject(unit))
      );
  }

  async getQuantities(): Promise<Quantity[]> {
    return await database
      .select()
      .from('quantities')
      .orderBy('quantity_id', 'asc')
      .then((records: QuantityRecord[]) =>
        records.map((quantity) => createQuantityObject(quantity))
      );
  }

  async getUnitsAsJson(): Promise<string> {
    const EXPORT_DATE = new Date();

    const units = await this.getUnits();
    const quantities = await this.getQuantities();

    return JSON.stringify({
      version: EXPORT_VERSION,
      exportDate: EXPORT_DATE,
      units,
      quantities,
    });
  }

  async upsertQuantity(quantity: Quantity): Promise<Quantity> {
    await database
      .insert({
        quantity_id: quantity.id,
      })
      .into('quantities')
      .onConflict('quantity_id')
      .ignore();

    return quantity;
  }

  convertStringToUnitsExport = (string: string): UnitsExport => {
    const object = JSON.parse(string);
    object.exportDate = new Date(object.exportDate);

    return object;
  };

  isUnitValid = (unit: Unit): boolean => {
    return (
      unit.unit !== undefined &&
      unit.quantity !== undefined &&
      unit.symbol !== undefined &&
      unit.siConversionFormula !== undefined &&
      isSiConversionFormulaValid(unit.siConversionFormula) === true
    );
  };

  async validateUnitsImport(json: string): Promise<UnitsImportWithValidation> {
    const unitsExport = this.convertStringToUnitsExport(json);
    const errors: string[] = [];
    const questionComparisons: UnitComparison[] = [];

    if (isBelowVersion(unitsExport.version, MIN_SUPPORTED_VERSION)) {
      throw new Error(
        `Units version ${unitsExport.version} is below the minimum supported version ${MIN_SUPPORTED_VERSION}.`
      );
    }

    if (isAboveVersion(unitsExport.version, EXPORT_VERSION)) {
      throw new Error(
        `Units version ${unitsExport.version} is above the current supported version ${EXPORT_VERSION}.`
      );
    }

    if (!unitsExport.units) {
      throw new Error('Units field is missing from file you are importing');
    }

    if (!unitsExport.quantities) {
      throw new Error(
        'Quantities field is missing from file you are importing'
      );
    }

    const unitIds = unitsExport.units.map((unit) => unit.id);

    const existingUnits = (await this.getUnits()).filter((unit) =>
      unitIds.includes(unit.id)
    );

    const newUnits = unitsExport.units.map(
      (unit) =>
        new Unit(
          unit.id,
          unit.unit,
          unit.quantity,
          unit.symbol,
          unit.siConversionFormula
        )
    );

    for await (const newUnit of newUnits) {
      if (this.isUnitValid(newUnit) === false) {
        errors.push(
          `Unit "${newUnit.unit}" is not valid: "${JSON.stringify(newUnit)}"`
        );
        continue;
      }
      const existingUnit =
        existingUnits.find((existingUnit) => existingUnit.id === newUnit.id) ||
        null;

      if (!existingUnit) {
        questionComparisons.push({
          existingUnit: null,
          newUnit: newUnit,
          status: ComparisonStatus.NEW,
          conflictResolutionStrategy: ConflictResolutionStrategy.USE_NEW,
        });
      } else {
        if (deepEqual(newUnit, existingUnit)) {
          questionComparisons.push({
            existingUnit: existingUnit,
            newUnit: newUnit,
            status: ComparisonStatus.SAME,
            conflictResolutionStrategy: ConflictResolutionStrategy.USE_EXISTING,
          });
        } else {
          questionComparisons.push({
            existingUnit: existingUnit,
            newUnit: newUnit,
            status: ComparisonStatus.DIFFERENT,
            conflictResolutionStrategy: ConflictResolutionStrategy.UNRESOLVED,
          });
        }
      }
    }

    return {
      json: json,
      version: unitsExport.version,
      exportDate: unitsExport.exportDate,
      errors: errors,
      unitComparisons: questionComparisons,
      isValid: errors.length === 0,
    };
  }

  async importUnits(args: ImportUnitsArgs): Promise<Unit[]> {
    const { json, conflictResolutions } = args;
    const { units, quantities } = this.convertStringToUnitsExport(json);

    await Promise.all(
      quantities.map(async (quantity) => this.upsertQuantity(quantity))
    );

    await Promise.all(
      units.map(async (unit) => {
        const conflictResolution = conflictResolutions.find(
          (resolution) => resolution.itemId === unit.id
        );
        switch (conflictResolution?.strategy) {
          case ConflictResolutionStrategy.USE_NEW:
            await this.deleteUnit(unit.id);
            await this.createUnit(unit);
            break;

          case ConflictResolutionStrategy.USE_EXISTING:
            break;
          case ConflictResolutionStrategy.UNRESOLVED:
            throw new Error('No conflict resolution strategy provided');
          default:
            throw new Error('Unknown conflict resolution strategy');
        }
      })
    );

    return this.getUnits();
  }
}
