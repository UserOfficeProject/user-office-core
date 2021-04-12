import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { SystemDataSource } from '../datasources/SystemDataSource';

@injectable()
export default class SystemQueries {
  constructor(
    @inject(Tokens.SystemDataSource) private dataSource: SystemDataSource
  ) {}

  async connectivityCheck(): Promise<boolean> {
    return this.dataSource.connectivityCheck();
  }
}
