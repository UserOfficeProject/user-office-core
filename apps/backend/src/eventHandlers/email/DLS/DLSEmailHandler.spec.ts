import { faker } from '@faker-js/faker';
import 'reflect-metadata';
import { container } from 'tsyringe';

import { DLSEmailHandler } from './DLSEmailHandler';
import { Tokens } from '../../../config/Tokens';
import { GetInvitesFilter } from '../../../datasources/InviteDataSource';
import { CallDataSourceMock } from '../../../datasources/mockups/CallDataSource';
import { EmailTemplateDataSourceMock } from '../../../datasources/mockups/EmailTemplateDataSource';
import { InstrumentDataSourceMock } from '../../../datasources/mockups/InstrumentDataSource';
import { InviteDataSourceMock } from '../../../datasources/mockups/InviteDataSource';
import { ProposalDataSourceMock } from '../../../datasources/mockups/ProposalDataSource';
import { QuestionaryDataSourceMock } from '../../../datasources/mockups/QuestionaryDataSource';
import { ApplicationEvent } from '../../../events/applicationEvents';
import { Event } from '../../../events/event.enum';
import { AnswerBasic } from '../../../models/Questionary';
import { EmailTemplateId } from '../emailTemplateId';

// Mock MailService
const mockMailService = {
  sendMail: jest.fn(),
};

describe('DLSEmailHandler', () => {
  let emailTemplateDataSourceMock: EmailTemplateDataSourceMock;
  let proposalDataSourceMock: ProposalDataSourceMock;
  let instrumentDataSourceMock: InstrumentDataSourceMock;
  let callDataSourceMock: CallDataSourceMock;
  let questionaryDataSourceMock: QuestionaryDataSourceMock;
  let inviteDataSourceMock: InviteDataSourceMock;

  beforeAll(() => {
    container.registerInstance(Tokens.MailService, mockMailService);
  });

  beforeEach(() => {
    emailTemplateDataSourceMock =
      container.resolve<EmailTemplateDataSourceMock>(
        Tokens.EmailTemplateDataSource
      );
    proposalDataSourceMock = container.resolve<ProposalDataSourceMock>(
      Tokens.ProposalDataSource
    );
    instrumentDataSourceMock = container.resolve<InstrumentDataSourceMock>(
      Tokens.InstrumentDataSource
    );
    callDataSourceMock = container.resolve<CallDataSourceMock>(
      Tokens.CallDataSource
    );
    questionaryDataSourceMock = container.resolve<QuestionaryDataSourceMock>(
      Tokens.QuestionaryDataSource
    );
    inviteDataSourceMock = container.resolve<InviteDataSourceMock>(
      Tokens.InviteDataSource
    );
    emailTemplateDataSourceMock.init();
    proposalDataSourceMock.init();
    questionaryDataSourceMock.init();
    inviteDataSourceMock.init();

    jest.spyOn(questionaryDataSourceMock, 'getAnswer').mockResolvedValue({
      answer: {
        value: [
          {
            instrumentId: 1,
            timeRequested: 1,
          },
        ],
      },
    } as AnswerBasic);

    // Reset mock
    mockMailService.sendMail.mockClear();
    mockMailService.sendMail.mockResolvedValue({ success: true });
  });

  const emails = [
    [Event.PROPOSAL_SUBMITTED, EmailTemplateId.PROPOSAL_SUBMITTED],
    [
      Event.PROPOSAL_CO_PROPOSER_INVITES_UPDATED,
      EmailTemplateId.CO_PROPOSER_INVITE,
    ],
  ];

  test.each(emails)(
    'Given event type "%s", should use template "%s"',
    async (event, templateId) => {
      const mockEvent: ApplicationEvent = {
        type: event,
        proposal: {
          primaryKey: 1,
          title: faker.lorem.sentence(),
          proposerId: 1,
          proposalId: faker.string.alphanumeric(),
          callId: 1,
          submittedDate: new Date(),
        },
        isRejection: false,
        array: await inviteDataSourceMock.getInvites({} as GetInvitesFilter),
        proposalPKey: 1,
        key: 'test',
        loggedInUserId: 1,
      } as ApplicationEvent;

      const expectedEmailTemplate =
        await emailTemplateDataSourceMock.getEmailTemplateByName(templateId);

      await DLSEmailHandler(mockEvent);

      expect(mockMailService.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          content: {
            template: expectedEmailTemplate?.id.toString(),
          },
        })
      );
    }
  );
});
