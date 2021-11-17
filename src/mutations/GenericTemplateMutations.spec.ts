import 'reflect-metadata';
import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { GenericTemplateDataSourceMock } from '../datasources/mockups/GenericTemplateDataSource';
import {
  dummyUserNotOnProposalWithRole,
  dummyUserOfficerWithRole,
  dummyUserWithRole,
} from '../datasources/mockups/UserDataSource';
import { GenericTemplate } from '../models/GenericTemplate';
import { isRejection, Rejection } from '../models/Rejection';
import GenericTemplateMutations from './GenericTemplateMutations';

const genericTemplateMutations = container.resolve(GenericTemplateMutations);

beforeEach(() => {
  container
    .resolve<GenericTemplateDataSourceMock>(Tokens.GenericTemplateDataSource)
    .init();
});

test('User should be able to clone its genericTemplate', () => {
  return expect(
    genericTemplateMutations.cloneGenericTemplate(dummyUserWithRole, 1)
  ).resolves.toBeInstanceOf(GenericTemplate);
});

test('User officer should be able to clone genericTemplate', () => {
  return expect(
    genericTemplateMutations.cloneGenericTemplate(dummyUserOfficerWithRole, 1)
  ).resolves.toBeInstanceOf(GenericTemplate);
});

test('User should not be able to clone genericTemplate that does not exist', () => {
  return expect(
    genericTemplateMutations.cloneGenericTemplate(dummyUserOfficerWithRole, 100)
  ).resolves.toBeInstanceOf(Rejection);
});

test('User should be able to update title of the genericTemplate', () => {
  const newTitle = 'Updated title';

  return expect(
    genericTemplateMutations.updateGenericTemplate(dummyUserWithRole, {
      genericTemplateId: 1,
      title: newTitle,
    })
  ).resolves.toHaveProperty('title', newTitle);
});

test('User can delete genericTemplate', async () => {
  const result = await genericTemplateMutations.deleteGenericTemplate(
    dummyUserWithRole,
    1
  );
  expect(isRejection(result)).toBeFalsy();
});

test('User not on proposal can not delete genericTemplate', async () => {
  const result = await genericTemplateMutations.deleteGenericTemplate(
    dummyUserNotOnProposalWithRole,
    1
  );
  expect(isRejection(result)).toBeTruthy();
});

test('User can update genericTemplate', async () => {
  const updatedTitle = 'Updated title';
  const result = await genericTemplateMutations.updateGenericTemplate(
    dummyUserWithRole,
    {
      genericTemplateId: 1,
      title: updatedTitle,
    }
  );
  expect((result as GenericTemplate).title).toEqual(updatedTitle);
});

test('User not on proposal can not update genericTemplate', async () => {
  const result = await genericTemplateMutations.updateGenericTemplate(
    dummyUserNotOnProposalWithRole,
    { genericTemplateId: 1, title: 'Not my genericTemplate' }
  );
  expect(isRejection(result)).toBeTruthy();
});
