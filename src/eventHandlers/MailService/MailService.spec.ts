/* eslint-disable @typescript-eslint/camelcase */
import * as path from 'path';

import EmailSettings from './EmailSettings';
import { SMTPMailService } from './SMTPMailService';

test('Return result should be void to indicate all emails successfully sent', async () => {
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
        address: {
          email: 'john.doe@email.com',
          header_to: 'john.doe@email.com',
        },
      },
      {
        address: {
          email: 'jane.doe@email.com',
          header_to: 'jane.doe@email.com',
        },
      },
    ],
  };

  const smtpMailService: SMTPMailService = new SMTPMailService();
  const result = await smtpMailService.sendMail(options);

  return expect(result).toBe('Emails sent');
});
