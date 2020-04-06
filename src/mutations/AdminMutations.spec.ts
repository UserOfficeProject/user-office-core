import 'reflect-metadata';
import { AdminDataSourceMock } from '../datasources/mockups/AdminDataSource';
import { ReviewDataSourceMock } from '../datasources/mockups/ReviewDataSource';
import {
  dummyUserOfficer,
  UserDataSourceMock,
} from '../datasources/mockups/UserDataSource';
import { Page } from '../models/Admin';
import { UserAuthorization } from '../utils/UserAuthorization';
import AdminMutations from './AdminMutations';

const userAuthorization = new UserAuthorization(
  new UserDataSourceMock(),
  new ReviewDataSourceMock()
);
const adminMutations = new AdminMutations(
  new AdminDataSourceMock(),
  userAuthorization
);

test('A user can not set page text', () => {
  return expect(
    adminMutations.setPageText(null, 1, 'New page contents')
  ).resolves.not.toBeInstanceOf(Page);
});

test('A user officer can set page text', () => {
  return expect(
    adminMutations.setPageText(dummyUserOfficer, 1, '')
  ).resolves.toBeInstanceOf(Page);
});
