import 'reflect-metadata';
import { faker } from '@faker-js/faker';
import * as Logger from '@user-office-software/duo-logger';
import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { ApplicationEvent } from '../../events/applicationEvents';
import { Event } from '../../events/event.enum';
import { stfcEmailHandler } from './stfcEmailHandler';

const ORIGINAL_ENV = process.env;
const spyLogError = jest
  .spyOn(Logger.logger, 'logError')
  .mockImplementation(() => {});
const spyLogInfo = jest
  .spyOn(Logger.logger, 'logInfo')
  .mockImplementation(() => {});
// Mock MailService
const mockMailService = {
  sendMail: jest.fn(),
};
//we should have a test email inbocx to recieve all the email instead of skipping it, for e2e testing and for better pathways
describe('stfcEmailHandler', () => {
  beforeAll(() => {
    container.registerInstance(Tokens.MailService, mockMailService);
  });
  afterEach(() => {
    process.env = ORIGINAL_ENV;
    jest.clearAllMocks();
    jest.resetModules();
  });

  describe('handling CALL_CREATED event', () => {
    it('When running Node process does not have env.FBS_EMAIL value', () => {
      process.env.FBS_EMAIL = '';
      const mockEvent = {
        type: Event.CALL_CREATED,
        call: {},
        isRejection: false,
      } as ApplicationEvent;

      stfcEmailHandler(mockEvent);

      expect(process.env.FBS_EMAIL).toBe('');
      expect(spyLogError).toHaveBeenCalledTimes(1);
      expect(spyLogError).toHaveBeenCalledWith(
        'Could not send email(s) on call creation, environmental variable (FBS_EMAIL) not found',
        {}
      );
    });
  });

  describe('mailService.sendMail is sucessful', () => {
    it('When all required settings are valid', async () => {
      // here instead of using a rng email, we instead set a magic variable for readability
      // This test us
      const inviteEmail = faker.internet.email();
      process.env.FBS_EMAIL = inviteEmail;
      const mockEvent = {
        type: Event.CALL_CREATED,
        call: {
          shortCode: 'string',
          startCall: new Date(2000, 1, 1),
          endCall: new Date(2000, 1, 2),
        },
        isRejection: false,
      } as ApplicationEvent;

      //create mock instances
      mockMailService.sendMail.mockResolvedValue({ success: true });

      await stfcEmailHandler(mockEvent);

      expect(process.env.FBS_EMAIL).toBe(inviteEmail);
      expect(mockMailService.sendMail).toHaveBeenCalledWith({
        content: { template_id: 'call-created-email' },
        substitution_data: {
          shortCode: 'string',
          startCall: new Date(2000, 1, 1),
          endCall: new Date(2000, 1, 2),
        },
        recipients: [{ address: inviteEmail }],
      });
      expect(spyLogInfo).toHaveBeenCalledTimes(1);
      // this result is derived from the SkipSendMailService.ts, as that is what is mapped in the test environment
      expect(spyLogInfo).toHaveBeenCalledWith('Emails sent on call creation:', {
        result: {
          success: true,
        },
        event: mockEvent,
      });
    });
  });

  describe('mailService.sendMail is not sucessful', () => {
    it('Then mailService.catch is evoked, logError(x) will be present', async () => {
      const inviteEmail = faker.internet.email();
      process.env.FBS_EMAIL = inviteEmail;
      const mockEvent = {
        type: Event.CALL_CREATED,
        call: {
          shortCode: 'error',
        },
        isRejection: false,
      } as ApplicationEvent;
      const forcedError = new Error('SMTP down');

      mockMailService.sendMail.mockRejectedValueOnce(forcedError);
      container.registerInstance(Tokens.MailService, mockMailService);

      await stfcEmailHandler(mockEvent);
      // have added this line as the class.method in the handler function is not asynced
      // and the asserts/expects will check before .then or .catch gets process
      await new Promise(setImmediate);

      expect(mockMailService.sendMail).toHaveBeenCalledWith({
        content: { template_id: 'call-created-email' },
        substitution_data: {
          shortCode: 'error',
        },
        recipients: [{ address: inviteEmail }],
      });
      expect(mockMailService.sendMail).toHaveBeenCalled();
      expect(spyLogError).toHaveBeenCalledTimes(1);
      expect(spyLogError).toHaveBeenCalledWith(
        'Could not send email(s) on call creation:',
        {
          error: forcedError,
          event: mockEvent,
        }
      );
    });
  });
});
