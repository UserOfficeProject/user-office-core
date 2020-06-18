import 'reflect-metadata';
import {
  AdminDataSourceMock,
  dummyInstitution,
} from '../datasources/mockups/AdminDataSource';
import {
  dummyUserOfficerWithRole,
  dummyUserWithRole,
} from '../datasources/mockups/UserDataSource';
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

test('A user officer can delete a institution', () => {
  return expect(
    adminMutations.deleteInstitutions(dummyUserOfficerWithRole, 1)
  ).resolves.toBe(dummyInstitution);
});

test('A user officer can create a institution', () => {
  return expect(
    adminMutations.createInstitutions(
      dummyUserOfficerWithRole,
      dummyInstitution
    )
  ).resolves.toBe(dummyInstitution);
});

test('A user officer can update a institution', () => {
  return expect(
    adminMutations.updateInstitutions(
      dummyUserOfficerWithRole,
      dummyInstitution
    )
  ).resolves.toBe(dummyInstitution);
});

test('A user can not update a institution', () => {
  return expect(
    adminMutations.updateInstitutions(dummyUserWithRole, {
      id: 1,
      name: 'something',
      verified: true,
    })
  ).resolves.toHaveProperty('reason', 'INSUFFICIENT_PERMISSIONS');
});
