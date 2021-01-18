import 'reflect-metadata';
import SystemDataSourceMock from '../datasources/mockups/SystemDataSource';
import SystemQueries from './SystemQueries';

const dummySystemDataSource = new SystemDataSourceMock();
const systemQueries = new SystemQueries(dummySystemDataSource);

test('Healthcheck should pass', () => {
  return expect(systemQueries.connectivityCheck()).resolves.toBeTruthy();
});
