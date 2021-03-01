import * as path from 'path';

import EmailSettings from './EmailSettings';
import { SMTPMailService } from './SMTPMailService';

jest.mock('email-templates');

test('Return result should indicate all emails were successfully sent', async () => {
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
