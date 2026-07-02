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
import { getTopicActiveAnswers } from '../../../models/ProposalModelFunctions';
import { Answer, QuestionaryStep } from '../../../models/Questionary';
import { DataType } from '../../../models/Template';
import { MailService } from '../../MailService/MailService';
import { EmailTemplateId } from '../emailTemplateId';

type InstrumentPickerAnswerValue = {
  instrumentId: number | string;
  timeRequested?: number | string | null;
};

const getInstrumentPickerAnswers = (
  questionarySteps: QuestionaryStep[]
): Answer[] =>
  questionarySteps
    .flatMap((step) => getTopicActiveAnswers(questionarySteps, step.topic.id))
    .filter(
      (answer) => answer.question.dataType === DataType.INSTRUMENT_PICKER
    );

const getInstrumentPickerAnswerValues = (
  value: unknown
): InstrumentPickerAnswerValue[] => {
  const values = Array.isArray(value) ? value : value ? [value] : [];

  return values.filter(
    (instrumentAnswer): instrumentAnswer is InstrumentPickerAnswerValue =>
      typeof instrumentAnswer === 'object' &&
      instrumentAnswer !== null &&
      'instrumentId' in instrumentAnswer
  );
};

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

  const questionarySteps = await questionaryDataSource.getQuestionarySteps(
    event.proposal.questionaryId
  );

  const instrumentPickerAnswers = getInstrumentPickerAnswers(questionarySteps);
  const instrumentPickerAnswerValues = instrumentPickerAnswers.flatMap(
    (answer) => getInstrumentPickerAnswerValues(answer.value)
  );
  const instrumentIds = Array.from(
    new Set(
      instrumentPickerAnswerValues
        .map((instrumentAnswer) => Number(instrumentAnswer.instrumentId))
        .filter((instrumentId) => Number.isFinite(instrumentId))
    )
  );

  const instruments = await instrumentSource.getInstrumentsByIds(instrumentIds);
  const requested = instrumentPickerAnswerValues
    .map((instrumentAnswer) => {
      const requestedTime = Number(instrumentAnswer.timeRequested ?? 0);
      const formattedRequestedTime = Number.isFinite(requestedTime)
        ? requestedTime
        : 0;
      const instrument = instruments.find(
        (inst) => inst.id === Number(instrumentAnswer.instrumentId)
      );
      if (!instrument) {
        return null;
      }

      const timeUnit = `${call.allocationTimeUnit}${
        formattedRequestedTime > 1 || formattedRequestedTime === 0 ? 's' : ''
      }`;

      return [
        `${instrument.name}:`,
        instrument.description,
        formattedRequestedTime,
        timeUnit,
      ].join(' ');
    })
    .filter((request): request is string => request !== null)
    .join(', ');

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
          (principalInvestigator.preferredname ||
            principalInvestigator.firstname) +
          ' ' +
          principalInvestigator.lastname,
        establishment: principalInvestigator.institution,
        alternativeContacts: '',
        coinvestigators: participants.map(
          (partipant) =>
            `${partipant.preferredname || partipant.firstname} ${partipant.lastname} `
        ),
        requested,
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

      continue;
    }

    // Create a copy of options for each participant to avoid mutation issues
    const participantEmailOptions = {
      ...options,
      substitution_data: {
        ...(options.substitution_data as any),
        name: participant.preferredname || participant.firstname,
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
