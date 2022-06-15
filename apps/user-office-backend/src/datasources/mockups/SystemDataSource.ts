import { SystemDataSource } from '../SystemDataSource';

export default class SystemDataSourceMock implements SystemDataSource {
  async connectivityCheck(): Promise<boolean> {
    return true;
  }
}
