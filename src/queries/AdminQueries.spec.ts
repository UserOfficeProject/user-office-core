import 'reflect-metadata';
import { AdminDataSourceMock } from '../datasources/mockups/AdminDataSource';
import { ReviewDataSourceMock } from '../datasources/mockups/ReviewDataSource';
import { UserDataSourceMock } from '../datasources/mockups/UserDataSource';
import { UserAuthorization } from '../utils/UserAuthorization';
import AdminQueries from './AdminQueries';

const userAuthorization = new UserAuthorization(
  new UserDataSourceMock(),
  new ReviewDataSourceMock()
);
const adminQueries = new AdminQueries(
  new AdminDataSourceMock(),
  userAuthorization
);

test('A user can get page text', () => {
  return expect(adminQueries.getPageText(1)).resolves.toBe('HELLO WORLD');
});
