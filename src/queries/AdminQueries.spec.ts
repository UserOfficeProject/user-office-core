import 'reflect-metadata';
import { AdminDataSourceMock } from '../datasources/mockups/AdminDataSource';
import AdminQueries from './AdminQueries';

const adminQueries = new AdminQueries(new AdminDataSourceMock());

test('A user can get page text', () => {
  return expect(adminQueries.getPageText(1)).resolves.toBe('HELLO WORLD');
});
