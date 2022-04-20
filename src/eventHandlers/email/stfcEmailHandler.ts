import { logger } from '@user-office-software/duo-logger';
import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { CallDataSource } from '../../datasources/CallDataSource';
import { UserDataSource } from '../../datasources/UserDataSource';
import { ApplicationEvent } from '../../events/applicationEvents';
import { Event } from '../../events/event.enum';
import { Proposal } from '../../models/Proposal';
import { User } from '../../models/User';
import EmailSettings from '../MailService/EmailSettings';
import { MailService } from '../MailService/MailService';

export async function stfcEmailHandler(event: ApplicationEvent) {
  const mailService = container.resolve<MailService>(Tokens.MailService);
  const callDataSource = container.resolve<CallDataSource>(
    Tokens.CallDataSource
  );
  const userDataSource = container.resolve<UserDataSource>(
    Tokens.UserDataSource
  );

  if (event.isRejection) {
    return;
  }

  switch (event.type) {
    /*
     * Send the PI and co-proposers an email when any proposal is submitted.
     * Send the User Office an email when a Rapid Access proposal is submitted.
     */
    case Event.PROPOSAL_SUBMITTED: {
      const emailsToSend: EmailSettings[] = [];

      const principalInvestigator = await userDataSource.getUser(
        event.proposal.proposerId
      );
      const participants = await userDataSource.getProposalUsersFull(
        event.proposal.primaryKey
      );

      if (principalInvestigator) {
        const piEmail = piSubmissionEmail(
          event.proposal,
          principalInvestigator,
          participants
        );

        emailsToSend.push(piEmail);
      } else {
        logger.logWarn(
          'Could not send submission confirmation email to PI and participants, as the PI details could not be retrieved.',
          { event }
        );
      }

      const call = await callDataSource.getCall(event.proposal.callId);

      const isIsis = call?.shortCode?.toLowerCase().includes('isis');
      const isRapidAccess =
        isIsis && call?.shortCode?.toLowerCase().includes('rapid');

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
  }
}

const piSubmissionEmail = (
  proposal: Proposal,
  pi: User,
  participants: User[]
): EmailSettings => ({
  content: {
    template_id: 'proposal-submitted',
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
    ...participants.map((partipant) => {
      return {
        address: {
          email: partipant.email,
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
