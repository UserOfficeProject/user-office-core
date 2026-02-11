import { container } from 'tsyringe';

import { dummyEmailTemplate } from '../datasources/mockups/EmailTemplateDataSource';
import {
  dummyUserOfficerWithRole,
  dummyUserWithRole,
} from '../datasources/mockups/UserDataSource';
import EmailTemplateMutations from './EmailTemplateMutations';

const emailTemplateMutations = container.resolve(EmailTemplateMutations);

beforeEach(() => {});

describe('Test Email Template Mutations', () => {
  test('A user can not create an email template', () => {
    return expect(
      emailTemplateMutations.create(dummyUserWithRole, {
        name: 'Dummy Email Template',
        description: 'This is a dummy email template for testing purposes.',
        useTemplateFile: false,
        subject: 'Welcome to Our Service',
        body: 'Hello, thank you for signing up for our service. We are excited to have you on board!',
        createdByUserId: 1,
      })
    ).resolves.toHaveProperty('reason', 'INSUFFICIENT_PERMISSIONS');
  });

  test('A not logged in user can not create an email template', () => {
    return expect(
      emailTemplateMutations.create(null, {
        name: 'Dummy Email Template',
        description: 'This is a dummy email template for testing purposes.',
        useTemplateFile: false,
        subject: 'Welcome to Our Service',
        body: 'Hello, thank you for signing up for our service. We are excited to have you on board!',
        createdByUserId: 1,
      })
    ).resolves.toHaveProperty('reason', 'NOT_LOGGED_IN');
  });

  test('A logged in user officer can create an email template', () => {
    const emailTemplateToCreate = {
      name: 'Dummy Email Template',
      description: 'This is a dummy email template for testing purposes.',
      useTemplateFile: false,
      subject: 'Welcome to Our Service',
      body: 'Hello, thank you for signing up for our service. We are excited to have you on board!',
      createdByUserId: 1,
    };

    return expect(
      emailTemplateMutations.create(
        dummyUserOfficerWithRole,
        emailTemplateToCreate
      )
    ).resolves.toStrictEqual({
      id: 1,
      createdAt: '',
      ...emailTemplateToCreate,
    });
  });

  test('A logged in user officer can update an email template', () => {
    const emailTemplateToUpdate = {
      id: 1,
      name: 'Dummy Email Template',
      description: 'This is a dummy email template for testing purposes.',
      useTemplateFile: false,
      subject: 'Welcome to Our Service',
      body: 'Hello, thank you for signing up for our service. We are excited to have you on board!',
      createdByUserId: 1,
    };

    return expect(
      emailTemplateMutations.update(
        dummyUserOfficerWithRole,
        emailTemplateToUpdate
      )
    ).resolves.toStrictEqual({
      createdAt: '',
      ...emailTemplateToUpdate,
    });
  });

  test('A logged in user officer can delete email template', () => {
    return expect(
      emailTemplateMutations.delete(dummyUserOfficerWithRole, {
        emailTemplateId: 1,
      })
    ).resolves.toBe(dummyEmailTemplate);
  });
});
