import 'reflect-metadata';
import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { GenericTemplateDataSourceMock } from '../datasources/mockups/GenericTemplateDataSource';
import { dummyUserOfficerWithRole } from '../datasources/mockups/UserDataSource';
import GenericTemplateQueries from './GenericTemplateQueries';

const genericTemplateQueries = container.resolve(GenericTemplateQueries);

beforeEach(() => {
  container
    .resolve<GenericTemplateDataSourceMock>(Tokens.GenericTemplateDataSource)
    .init();
});

test('A userofficer can get genericTemplates', () => {
  return expect(
    genericTemplateQueries.getGenericTemplates(dummyUserOfficerWithRole, {})
  ).resolves.not.toBe(null);
});

test('A userofficer should get', () => {
  return expect(
    genericTemplateQueries.getGenericTemplates(dummyUserOfficerWithRole, {})
  ).resolves.not.toBe(null);
});
