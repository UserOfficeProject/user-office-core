import { SystemDataSource } from '../datasources/SystemDataSource';

export default class SystemQueries {
  constructor(private systemDataSource: SystemDataSource) {}

  async connectivityCheck(): Promise<boolean> {
    return this.systemDataSource.connectivityCheck();
  }
}
