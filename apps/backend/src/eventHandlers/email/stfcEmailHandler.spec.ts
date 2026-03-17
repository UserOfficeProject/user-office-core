import { faker } from '@faker-js/faker';
import * as Logger from '@user-office-software/duo-logger';
import 'reflect-metadata';
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
describe('stfcEmailHandler', () => {
  beforeAll(() => {
    container.registerInstance(Tokens.MailService, mockMailService);
  });
  afterEach(() => {
    process.env = ORIGINAL_ENV;
    jest.clearAllMocks();
    jest.resetModules();
  });

  describe('These are the test for the handler function stfcEmailhandler', () => {
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

    it('mailService.sendMail is sucessful', async () => {
      // When all required settings are valid
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
        content: { template: 'call-created-email' },
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

    it('mailService.sendMail is not sucessful', async () => {
      // Then mailService.catch is evoked, logError(x) will be present
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
        content: { template: 'call-created-email' },
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
