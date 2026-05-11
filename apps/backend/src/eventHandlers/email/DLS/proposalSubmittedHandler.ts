import { logger } from '@user-office-software/duo-logger';
import { container } from 'tsyringe';

import { getBaseURL } from '../../../config/dls/configureDLSEnvironment';
import { Tokens } from '../../../config/Tokens';
import { CallDataSource } from '../../../datasources/CallDataSource';
import { EmailTemplateDataSource } from '../../../datasources/EmailTemplateDataSource';
import { InstrumentDataSource } from '../../../datasources/InstrumentDataSource';
import { QuestionaryDataSource } from '../../../datasources/QuestionaryDataSource';
import { UserDataSource } from '../../../datasources/UserDataSource';
import { ApplicationEvent } from '../../../events/applicationEvents';
import { Event } from '../../../events/event.enum';
import { MailService } from '../../MailService/MailService';
import { EmailTemplateId } from '../emailTemplateId';

export async function proposalSubmittedHandler(event: ApplicationEvent) {
  if (event.type != Event.PROPOSAL_SUBMITTED) return;

  const userDataSource = container.resolve<UserDataSource>(
    Tokens.UserDataSource
  );
  const callDataSource = container.resolve<CallDataSource>(
    Tokens.CallDataSource
  );
  const mailService = container.resolve<MailService>(Tokens.MailService);
  const instrumentSource = container.resolve<InstrumentDataSource>(
    Tokens.InstrumentDataSource
  );
  const questionaryDataSource = container.resolve<QuestionaryDataSource>(
    Tokens.QuestionaryDataSource
  );

  const emailTemplateDataSource = container.resolve<EmailTemplateDataSource>(
    Tokens.EmailTemplateDataSource
  );

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
      instrument.managementTimeAllocation = instrumentAnswer.timeRequested || 0;
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
      uos_instance: getBaseURL(),
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
