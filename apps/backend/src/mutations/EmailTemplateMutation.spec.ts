import { container } from 'tsyringe';

import { dummyUserWithRole } from '../datasources/mockups/UserDataSource';
import EmailTemplateMutations from './EmailTemplateMutations';

const emailTemplateMutations = container.resolve(EmailTemplateMutations);

beforeEach(() => {});

describe('Test Email Template Mutations', () => {
  test('A user can not create an email template', () => {
    return expect(
      emailTemplateMutations.create(dummyUserWithRole, {
        name: 'Test Email Template',
        description: 'Test email template description',
        createdByUserId: 1,
        subject: 'Test email template subject',
        body: 'Test email template body',
      })
    ).resolves.toHaveProperty('reason', 'INSUFFICIENT_PERMISSIONS');
  });
});
