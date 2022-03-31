import { Quantity } from './Quantity';
import { ComparisonStatus, ConflictResolutionStrategy } from './Template';

export class Unit {
  constructor(
    public id: string,
    public unit: string,
    public quantity: string,
    public symbol: string,
    public siConversionFormula: string
  ) {}
}

export class UnitComparison {
  constructor(
    public existingUnit: Unit | null,
    public newUnit: Unit,
    public status: ComparisonStatus,
    public conflictResolutionStrategy: ConflictResolutionStrategy
  ) {}
}

export class UnitsImportWithValidation {
  constructor(
    public json: string,
    public version: string,
    public exportDate: Date,
    public isValid: boolean,
    public errors: string[],
    public unitComparisons: UnitComparison[]
  ) {}
}

export class UnitsExport {
  constructor(
    public version: string,
    public exportDate: Date,
    public units: Unit[],
    public quantities: Quantity[]
  ) {}
}
