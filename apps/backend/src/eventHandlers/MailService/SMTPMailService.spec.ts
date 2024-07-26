import * as path from 'path';

import EmailTemplates from 'email-templates';
import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { AdminDataSource } from '../../datasources/AdminDataSource';
import { SettingsId } from '../../models/Settings';
import EmailSettings from './EmailSettings';
import { SMTPMailService } from './SMTPMailService';

jest.mock('email-templates');
const mockAdminDataSource = container.resolve(
  Tokens.AdminDataSource
) as AdminDataSource;

test('Return result should indicate all emails were successfully sent', async () => {
  jest.spyOn(mockAdminDataSource, 'getSetting').mockResolvedValue(null);

  const options: EmailSettings = {
    content: {
      template_id: path.resolve('src', 'eventHandlers', 'emails', 'submit'),
    },
    substitution_data: {
      piPreferredname: 'John',
      piLastname: 'Doe',
      proposalNumber: '1',
      proposalTitle: 'Title',
      coProposers: ['Jane Doe'],
      call: '',
    },
    recipients: [
      {
        address: 'john.doe@email.com',
      },
    ],
  };

  const smtpMailService: SMTPMailService = new SMTPMailService();
  const result = await smtpMailService.sendMail(options);

  return expect(result).toStrictEqual({
    results: {
      id: 'test',
      total_accepted_recipients: 1,
      total_rejected_recipients: 0,
    },
  });
});

test('All emails with bcc were successfully sent', async () => {
  const emailInfo = jest.spyOn(EmailTemplates.prototype, 'send');

  const bccEmail = 'testmail@test.co';

  const substitutionData = {
    piPreferredname: 'John',
    piLastname: 'Doe',
    proposalNumber: '1',
    proposalTitle: 'Title',
    coProposers: ['Jane Doe'],
    call: '',
  };

  jest.spyOn(mockAdminDataSource, 'getSetting').mockResolvedValue({
    settingsValue: bccEmail,
    description: 'bcc mail',
    id: SettingsId.SMTP_BCC_EMAIL,
  });

  const options: EmailSettings = {
    content: {
      template_id: path.resolve('src', 'eventHandlers', 'emails', 'submit'),
    },
    substitution_data: substitutionData,
    recipients: [
      {
        address: 'john.doe@email.com',
      },
    ],
  };

  const smtpMailService: SMTPMailService = new SMTPMailService();
  const result = await smtpMailService.sendMail(options);

  expect(emailInfo).toHaveBeenCalledWith({
    template: '/app/src/eventHandlers/emails/submit',
    message: {
      to: process.env.SINK_EMAIL,
      bcc: bccEmail,
    },
    locals: substitutionData,
  });

  return expect(result).toStrictEqual({
    results: {
      id: 'test',
      total_accepted_recipients: 1,
      total_rejected_recipients: 0,
    },
  });
});
