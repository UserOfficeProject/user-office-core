import { logger } from '@user-office-software/duo-logger';
import { container } from 'tsyringe';

import { EmailTemplateId } from './emailTemplateId';
import { getUASInstance } from '../../config/dls/configureDLSEnvironment';
import { Tokens } from '../../config/Tokens';
import { CallDataSource } from '../../datasources/CallDataSource';
import { EmailTemplateDataSource } from '../../datasources/EmailTemplateDataSource';
import { InstrumentDataSource } from '../../datasources/InstrumentDataSource';
import { InviteDataSource } from '../../datasources/InviteDataSource';
import { QuestionaryDataSource } from '../../datasources/QuestionaryDataSource';
import { UserDataSource } from '../../datasources/UserDataSource';
import { ApplicationEvent } from '../../events/applicationEvents';
import { Event } from '../../events/event.enum';
import { EventBus } from '../../events/eventBus';
import { MailService } from '../MailService/MailService';

export async function dlsEmailHandler(event: ApplicationEvent) {
  const userDataSource = container.resolve<UserDataSource>(
    Tokens.UserDataSource
  );
  const callDataSource = container.resolve<CallDataSource>(
    Tokens.CallDataSource
  );

  //test for null
  if (event.isRejection) {
    return;
  }

  const mailService = container.resolve<MailService>(Tokens.MailService);
  const eventBus = container.resolve<EventBus<ApplicationEvent>>(
    Tokens.EventBus
  );
  const inviteDataSource = container.resolve<InviteDataSource>(
    Tokens.InviteDataSource
  );
  const instrumentSource = container.resolve<InstrumentDataSource>(
    Tokens.InstrumentDataSource
  );
  const questionaryDataSource = container.resolve<QuestionaryDataSource>(
    Tokens.QuestionaryDataSource
  );

  const emailTemplateDataSource = container.resolve<EmailTemplateDataSource>(
    Tokens.EmailTemplateDataSource
  );

  switch (event.type) {
    case Event.PROPOSAL_SUBMITTED: {
      const principalInvestigator = await userDataSource.getUser(
        event.proposal.proposerId
      );
      if (!principalInvestigator) {
        return;
      }

      const participants = await userDataSource.getProposalUsersFull(
        event.proposal.primaryKey
      );

      const call = await callDataSource.getCall(event.proposal.callId);
      if (!call) {
        return;
      }

      const workflow = await callDataSource.getProposalWorkflowByCall(
        event.proposal.callId
      );

      const instruments = await instrumentSource.getInstrumentsByProposalPk(
        event.proposal.primaryKey
      );

      // Postgres implementation doesn't match interface - impliementation wants questionaryId, not proposalId
      const answer = await questionaryDataSource.getAnswer(
        event.proposal.questionaryId,
        'instrument_picker'
      );

      (
        answer?.answer as {
          value: { instrumentId: number; timeRequested: number }[];
        }
      )?.value.forEach((instrumentAnswer: any) => {
        const instrument = instruments.find(
          (inst) => inst.id === Number(instrumentAnswer.instrumentId)
        );
        if (instrument) {
          instrument.managementTimeAllocation =
            instrumentAnswer.timeRequested || 0;
        }
      });

      const shortDateFormat = new Intl.DateTimeFormat('en-GB', {
        month: 'short',
        year: 'numeric',
      });

      const longDateFormat = new Intl.DateTimeFormat('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });

      const allocationPeriod = `${shortDateFormat.format(call.startCycle)} - ${shortDateFormat.format(call.endCycle)}`;

      let baseURL = process.env.BASE_URL || '';
      if (baseURL.endsWith('/')) {
        baseURL = baseURL.slice(0, -1);
      }

      const template = EmailTemplateId.PROPOSAL_SUBMITTED;
      const emailTemplate =
        await emailTemplateDataSource.getEmailTemplateByName(template);
      if (!emailTemplate) {
        logger.logError('Email template not found', {
          template,
        });

        return;
      }

      const options = {
        content: {
          template: emailTemplate.id.toString(),
        },
        substitution_data: {
          name: '',
          proposal: {
            id: event.proposal.primaryKey,
            title: event.proposal.title,
            refNum: event.proposal.proposalId,
            submittedOn: event.proposal.submittedDate!.toLocaleString(),
            accessRoute: workflow?.name || 'N/A',
            principalInvestigator:
              principalInvestigator.preferredname +
              ' ' +
              principalInvestigator.lastname,
            establishment: principalInvestigator.institution,
            alternativeContacts: '',
            coinvestigators: participants.map(
              (partipant) => `${partipant.preferredname} ${partipant.lastname} `
            ),
            requested: instruments
              .map((instrument) => {
                return `${instrument.name}: ${instrument.description} ${instrument.managementTimeAllocation} ${call.allocationTimeUnit}${instrument.managementTimeAllocation > 1 ? 's' : ''}`;
              })
              .join(', '),
          },
          allocationPeriod: allocationPeriod,
          deadline: longDateFormat.format(call.endCall),
          uos_instance: process.env.BASE_URL,
        },
        recipients: [],
      };

      participants.push(principalInvestigator); // Ensure PI also gets an email

      for (const participant of participants) {
        if (!participant.email) {
          logger.logError(
            'Could not send email on proposal submission: participant has no email',
            { participant, event }
          );

          return;
        }

        // Create a copy of options for each participant to avoid mutation issues
        const participantEmailOptions = {
          ...options,
          substitution_data: {
            ...(options.substitution_data as any),
            name: participant.preferredname,
          },
          recipients: [
            {
              address: participant.email,
            },
          ],
        };

        mailService
          .sendMail(participantEmailOptions)
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
      }

      return;
    }
    case Event.PROPOSAL_CO_PROPOSER_INVITES_UPDATED: {
      const template = 'co-proposer-invite';
      const emailTemplate =
        await emailTemplateDataSource.getEmailTemplateByName(template);
      if (!emailTemplate) {
        logger.logError('Email template not found', {
          template,
        });

        return;
      }

      const invites = event.array;

      for (const invite of invites) {
        if (invite.isEmailSent) {
          continue;
        }
        const inviter = await userDataSource.getBasicUserInfo(
          invite.createdByUserId
        );

        if (!inviter) {
          logger.logError('No inviter found when trying to send email', {
            inviter,
            event,
          });

          return;
        }

        const options = {
          content: {
            template: emailTemplate.id.toString(),
          },
          substitution_data: {
            sender: inviter.preferredname + ' ' + inviter.lastname,
            redeem_code: invite.code,
            uos_instance: process.env.BASE_URL,
            uas_instance: getUASInstance(),
          },
          recipients: [{ address: invite.email }],
        };

        mailService
          .sendMail(options)
          .then(async (res: any) => {
            logger.logInfo('Emails sent on proposal invite:', {
              result: res,
              event,
            });

            await inviteDataSource.update({
              id: invite.id,
              isEmailSent: true,
              templateId: template,
            });

            await eventBus.publish({
              ...event,
              type: Event.PROPOSAL_CO_PROPOSER_INVITE_SENT,
              invite,
            });
          })
          .catch((err: string) => {
            logger.logError('Could not send email(s) on proposal invite:', {
              error: err,
              event,
            });
          });
      }
      break;
    }
  }
}
