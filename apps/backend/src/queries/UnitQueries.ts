import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { UnitDataSource } from '../datasources/UnitDataSource';

@injectable()
export default class UnitQueries {
  constructor(
    @inject(Tokens.UnitDataSource) private unitDataSource: UnitDataSource
  ) {}

  async getUnits() {
    return await this.unitDataSource.getUnits();
  }

  async getQuantities() {
    return await this.unitDataSource.getQuantities();
  }

  async getUnitsAsJson() {
    return await this.unitDataSource.getUnitsAsJson();
  }
}
