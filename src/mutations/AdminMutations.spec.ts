import 'reflect-metadata';
import { AdminDataSourceMock } from '../datasources/mockups/AdminDataSource';
import { dummyUserOfficerWithRole } from '../datasources/mockups/UserDataSource';
import { Page } from '../models/Admin';
import AdminMutations from './AdminMutations';

const adminMutations = new AdminMutations(new AdminDataSourceMock());

test('A user can not set page text', () => {
  return expect(
    adminMutations.setPageText(null, { id: 1, text: 'New page contents' })
  ).resolves.not.toBeInstanceOf(Page);
});

test('A user officer can set page text', () => {
  return expect(
    adminMutations.setPageText(dummyUserOfficerWithRole, { id: 1, text: '' })
  ).resolves.toBeInstanceOf(Page);
});
