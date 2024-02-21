import { logger } from '@user-office-software/duo-logger';
import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { CallDataSource } from '../../datasources/CallDataSource';
import { InstrumentDataSource } from '../../datasources/InstrumentDataSource';
import { UserDataSource } from '../../datasources/UserDataSource';
import { ApplicationEvent } from '../../events/applicationEvents';
import { Event } from '../../events/event.enum';
import { Proposal } from '../../models/Proposal';
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
  const InstrumentDataSource = container.resolve<InstrumentDataSource>(
    Tokens.InstrumentDataSource
  );

  switch (event.type) {
    /*
     * Send the PI and co-proposers an email when any proposal is submitted.
     * Send the User Office an email when a Rapid Access proposal is submitted.
     */
    case Event.PROPOSAL_SUBMITTED: {
      const emailsToSend: EmailSettings[] = [];

      const call = await callDataSource.getCall(event.proposal.callId);

      const instruments = await InstrumentDataSource.getInstrumentsByCallId([
        event.proposal.callId,
      ]);

      if (instruments.length == 0) {
        logger.logError(
          'Could not send email because no instrument was assigned to this call.',
          { event, call }
        );

        return;
      }

      const isRapidAccess =
        call?.shortCode?.toLowerCase().includes('rapid') || false;

      let piEmailTemplate: string;

      if (instruments[0].name === 'ISIS') {
        piEmailTemplate = isRapidAccess
          ? 'isis-rapid-proposal-submitted-pi'
          : 'isis-proposal-submitted-pi';
      } else {
        piEmailTemplate = 'clf-proposal-submitted-pi';
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

        emailsToSend.push(piEmail);
      } else {
        logger.logError(
          'Could not send submission confirmation email to PI and participants, as the PI details could not be retrieved.',
          { event }
        );
      }

      if (isRapidAccess) {
        const uoAddress = process.env.ISIS_UO_EMAIL;

        if (uoAddress) {
          const uoRapidEmail = uoRapidSubmissionEmail(
            event.proposal,
            principalInvestigator,
            participants,
            uoAddress
          );

          emailsToSend.push(uoRapidEmail);
        } else {
          logger.logError(
            'Could not send Rapid submission confirmation email to User Office, as the User Office email address was not specified.',
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
