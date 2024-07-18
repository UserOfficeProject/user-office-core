import { logger } from '@user-office-software/duo-logger';
import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { AdminDataSource } from '../../datasources/AdminDataSource';
import { CallDataSource } from '../../datasources/CallDataSource';
import { InstrumentDataSource } from '../../datasources/InstrumentDataSource';
import { QuestionaryDataSource } from '../../datasources/QuestionaryDataSource';
import { UserDataSource } from '../../datasources/UserDataSource';
import { ApplicationEvent } from '../../events/applicationEvents';
import { Event } from '../../events/event.enum';
import { Proposal } from '../../models/Proposal';
import { SettingsId } from '../../models/Settings';
import { User } from '../../models/User';
import EmailSettings from '../MailService/EmailSettings';
import { MailService } from '../MailService/MailService';

export async function stfcEmailHandler(event: ApplicationEvent) {
  //test for null
  if (event.isRejection) {
    return;
  }

  const mailService = container.resolve<MailService>(Tokens.MailService);
  const callDataSource = container.resolve<CallDataSource>(
    Tokens.CallDataSource
  );
  const userDataSource = container.resolve<UserDataSource>(
    Tokens.UserDataSource
  );
  const adminDataSource = container.resolve<AdminDataSource>(
    Tokens.AdminDataSource
  );

  const bccAddress = (await adminDataSource.getSetting(SettingsId.BCC_EMAIL))
    ?.settingsValue;

  switch (event.type) {
    /*
     * Send the PI and co-proposers an email when any proposal is submitted.
     * Send the User Office an email when a Rapid Access proposal is submitted.
     */
    case Event.PROPOSAL_SUBMITTED: {
      const emailsToSend: EmailSettings[] = [];

      const call = await callDataSource.getCall(event.proposal.callId);

      const callTitle = call?.shortCode?.toLowerCase() || '';

      const isIsis = callTitle.includes('isis');
      const isRapidAccess = callTitle.includes('rapid');
      const isClf = ['artemis', 'hpl', 'lsf'].some((fac) =>
        callTitle.includes(fac)
      );

      let piEmailTemplate: string;

      if (isIsis) {
        piEmailTemplate = isRapidAccess
          ? 'isis-rapid-proposal-submitted-pi'
          : 'isis-proposal-submitted-pi';
      } else if (isClf) {
        piEmailTemplate = 'clf-proposal-submitted-pi';
      } else {
        logger.logError(
          'Could not send email because facility could not be determined from call title.',
          { event, call, callTitle: call?.shortCode }
        );

        return;
      }

      const principalInvestigator = await userDataSource.getUser(
        event.proposal.proposerId
      );

      const participants = await userDataSource.getProposalUsersFull(
        event.proposal.primaryKey
      );

      if (principalInvestigator) {
        const piEmail = piSubmissionEmail(
          piEmailTemplate,
          event.proposal,
          principalInvestigator,
          participants
        );

        if (bccAddress) {
          piEmail.bcc = [{ address: bccAddress }];
        }

        emailsToSend.push(piEmail);
      } else {
        logger.logError(
          'Could not send submission confirmation email to PI and participants, as the PI details could not be retrieved.',
          { event }
        );
      }

      if (isRapidAccess) {
        const questionaries = container.resolve<QuestionaryDataSource>(
          Tokens.QuestionaryDataSource
        );
        const instruments = container.resolve<InstrumentDataSource>(
          Tokens.InstrumentDataSource
        );

        const answer = await questionaries.getAnswer(
          event.proposal.questionaryId,
          'isis_instrument_picker'
        );

        let instrumentRequested;

        if (answer) {
          instrumentRequested = (
            await instruments.getInstrument(answer?.answer.value)
          )?.name;
        }

        if (!instrumentRequested) {
          logger.logError(
            'Could not include instrument in the Rapid submission confirmation email to User Office.',
            { event }
          );

          instrumentRequested = '';
        }

        const uoAddress = (
          await adminDataSource.getSetting(SettingsId.USER_OFFICE_EMAIL)
        )?.settingsValue;

        if (uoAddress) {
          const uoRapidEmail = uoRapidSubmissionEmail(
            event.proposal,
            instrumentRequested,
            principalInvestigator,
            participants,
            uoAddress
          );

          if (bccAddress) {
            uoRapidEmail.bcc = [{ address: bccAddress }];
          }

          emailsToSend.push(uoRapidEmail);
        } else {
          logger.logError(
            'Could not send UO Rapid submission email as the setting (USER_OFFICE_EMAIL) is not set.',
            { event }
          );
        }
      }

      emailsToSend.forEach((emailSettings) => {
        mailService
          .sendMail(emailSettings)
          .then((res: any) => {
            logger.logInfo('Emails sent on proposal submission:', {
              result: res,
              event,
            });
          })
          .catch((err: string) => {
            logger.logError('Could not send email(s) on proposal submission:', {
              error: err,
              event,
            });
          });
      });

      return;
    }

    case Event.CALL_CREATED: {
      if (event?.call) {
        if (!(process.env && process.env.FBS_EMAIL)) {
          logger.logError(
            'Could not send email(s) on call creation, environmental variable (FBS_EMAIL) not found',
            {}
          );

          return;
        }
        const templateID = 'call-created-email';
        const notificationEmailAddress = process.env.FBS_EMAIL;
        const eventCallPartial = (({ shortCode, startCall, endCall }) => ({
          shortCode,
          startCall,
          endCall,
        }))(event.call);
        const emailSettings = callCreationEmail<typeof eventCallPartial>(
          eventCallPartial,
          templateID,
          notificationEmailAddress
        );

        if (bccAddress) {
          emailSettings.bcc = [{ address: bccAddress }];
        }

        mailService
          .sendMail(emailSettings)
          .then((res: any) => {
            logger.logInfo('Emails sent on call creation:', {
              result: res,
              event,
            });
          })
          .catch((err: string) => {
            logger.logError('Could not send email(s) on call creation:', {
              error: err,
              event,
            });
          });
      }

      return;
    }
  }
}

const piSubmissionEmail = (
  templateName: string,
  proposal: Proposal,
  pi: User,
  participants: User[]
): EmailSettings => ({
  content: {
    template_id: templateName,
  },
  substitution_data: {
    piPreferredname: pi.preferredname,
    piLastname: pi.lastname,
    proposalNumber: proposal.proposalId,
    proposalTitle: proposal.title,
    coProposers:
      participants.length > 0
        ? participants.map(
            (participant) =>
              `${participant.preferredname} ${participant.lastname} `
          )
        : '-',
  },
  recipients: [
    { address: pi.email },
    ...participants.map((participant) => {
      return {
        address: {
          email: participant.email,
          header_to: pi.email,
        },
      };
    }),
  ],
});

const uoRapidSubmissionEmail = (
  proposal: Proposal,
  instrument: string,
  pi: User | null,
  participants: User[],
  uoAddress: string
): EmailSettings => ({
  content: {
    template_id: 'isis-rapid-proposal-submitted-uo',
  },
  substitution_data: {
    piPreferredname: pi?.preferredname || '',
    piLastname: pi?.lastname || '',
    proposalNumber: proposal.proposalId,
    proposalTitle: proposal.title,
    coProposers:
      participants.length > 0
        ? participants.map(
            (participant) =>
              `${participant.preferredname} ${participant.lastname} `
          )
        : '-',
    instrument: instrument,
  },
  recipients: [{ address: uoAddress }],
});

const callCreationEmail = function createNotificationEmail<T>(
  notificationInput: T,
  templateID: string,
  notificationEmailAddress: string
): EmailSettings {
  const emailSettings: EmailSettings = {
    content: {
      template_id: templateID,
    },
    substitution_data: {
      ...notificationInput,
    },
    recipients: [
      {
        address: notificationEmailAddress,
      },
    ],
  };

  return emailSettings;
};
