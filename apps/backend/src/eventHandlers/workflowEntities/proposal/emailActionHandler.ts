import { logger } from '@user-office-software/duo-logger';
import { container } from 'tsyringe';

import {
  constructProposalStatusChangeEvent,
  EmailReadyType,
  getCoProposersAndFormatOutputForEmailSending,
  getFapChairSecretariesAndFormatOutputForEmailSending,
  getFapReviewersAndFormatOutputForEmailSending,
  getInstrumentScientistsAndFormatOutputForEmailSending,
  getOtherAndFormatOutputForEmailSending,
  getPIAndFormatOutputForEmailSending,
  getTechniqueScientistsAndFormatOutputForEmailSending,
  statusActionLogger,
} from './utils';
import { Tokens } from '../../../config/Tokens';
import { AdminDataSource } from '../../../datasources/AdminDataSource';
import { CallDataSource } from '../../../datasources/CallDataSource';
import { FapDataSource } from '../../../datasources/FapDataSource';
import { InstrumentDataSource } from '../../../datasources/InstrumentDataSource';
import { ReviewDataSource } from '../../../datasources/ReviewDataSource';
import { UserDataSource } from '../../../datasources/UserDataSource';
import { ApplicationEvent } from '../../../events/applicationEvents';
import { Instrument } from '../../../models/Instrument';
import { Proposal } from '../../../models/Proposal';
import { SettingsId } from '../../../models/Settings';
import { ConnectionHasStatusAction } from '../../../models/StatusAction';
import { TechnicalReview } from '../../../models/TechnicalReview';
import {
  EmailActionConfig,
  EmailStatusActionRecipients,
  EmailStatusActionRecipientsWithTemplate,
} from '../../../resolvers/types/StatusActionConfig';
import { stripHtml } from '../../../utils/stringStripHtml';
import { MailService } from '../../MailService/MailService';

export const emailActionHandler = async (
  statusAction: ConnectionHasStatusAction,
  proposals: Proposal[],
  options?: {
    statusActionsLogId?: number;
    loggedInUserId?: number;
    statusActionRecipients?: EmailStatusActionRecipients;
  }
) => {
  const { loggedInUserId, statusActionsLogId, statusActionRecipients } = {
    loggedInUserId: null,
    statusActionsLogId: null,
    statusActionRecipients: null,
    ...options,
  };
  const config = statusAction.config as EmailActionConfig;
  if (!config.recipientsWithEmailTemplate?.length) {
    return;
  }

  if (statusActionRecipients) {
    const recipientWithTemplate = config.recipientsWithEmailTemplate.find(
      (value) => value.recipient.name === statusActionRecipients
    );

    if (!recipientWithTemplate) {
      throw new Error(
        `Provided status action recipient does not match any available email recipients 
        ${statusActionRecipients}`
      );
    }
    emailStatusActionRecipient(
      recipientWithTemplate,
      statusAction,
      proposals,
      statusActionsLogId,
      loggedInUserId
    );

    return;
  }
  await Promise.all(
    config.recipientsWithEmailTemplate.map(async (recipientWithTemplate) =>
      emailStatusActionRecipient(
        recipientWithTemplate,
        statusAction,
        proposals,
        statusActionsLogId,
        loggedInUserId
      )
    )
  );
};

export const emailStatusActionRecipient = async (
  recipientWithTemplate: EmailStatusActionRecipientsWithTemplate,
  statusAction: ConnectionHasStatusAction,
  proposals: Proposal[],
  statusActionsLogId?: number | null,
  loggedInUserId?: number | null
) => {
  const proposalPks = proposals.map((proposal) => proposal.primaryKey);
  const emailTemplateId = recipientWithTemplate.emailTemplate.id;
  const successfulMessage = statusActionsLogId
    ? 'Email successfully sent on status action replay'
    : 'Email successfully sent';
  const failMessage = statusActionsLogId
    ? 'Email(s) could not be sent on status action replay'
    : 'Email(s) could not be sent';
  switch (recipientWithTemplate.recipient.name) {
    case EmailStatusActionRecipients.PI: {
      const PIs = await getPIAndFormatOutputForEmailSending(
        proposals,
        recipientWithTemplate
      );

      await sendMail(
        PIs,
        statusActionLogger({
          connectionId: statusAction.connectionId,
          actionId: statusAction.actionId,
          statusActionsLogId,
          emailStatusActionRecipient: EmailStatusActionRecipients.PI,
          proposalPks,
        }),
        successfulMessage,
        failMessage,
        emailTemplateId,
        loggedInUserId
      );

      break;
    }

    case EmailStatusActionRecipients.CO_PROPOSERS: {
      const CPs = await getCoProposersAndFormatOutputForEmailSending(
        proposals,
        recipientWithTemplate
      );
      CPs.length &&
        (await sendMail(
          CPs,
          statusActionLogger({
            connectionId: statusAction.connectionId,
            actionId: statusAction.actionId,
            statusActionsLogId,
            emailStatusActionRecipient:
              EmailStatusActionRecipients.CO_PROPOSERS,
            proposalPks,
          }),
          successfulMessage,
          failMessage,
          emailTemplateId,
          loggedInUserId
        ));

      break;
    }

    case EmailStatusActionRecipients.INSTRUMENT_SCIENTISTS: {
      const ISs = await getInstrumentScientistsAndFormatOutputForEmailSending(
        proposals,
        recipientWithTemplate
      );
      await sendMail(
        ISs,
        statusActionLogger({
          connectionId: statusAction.connectionId,
          actionId: statusAction.actionId,
          statusActionsLogId,
          emailStatusActionRecipient:
            EmailStatusActionRecipients.INSTRUMENT_SCIENTISTS,
          proposalPks,
        }),
        successfulMessage,
        failMessage,
        emailTemplateId,
        loggedInUserId
      );

      break;
    }

    case EmailStatusActionRecipients.FAP_REVIEWERS: {
      const FRs = await getFapReviewersAndFormatOutputForEmailSending(
        proposals,
        recipientWithTemplate
      );

      await sendMail(
        FRs,
        statusActionLogger({
          connectionId: statusAction.connectionId,
          actionId: statusAction.actionId,
          statusActionsLogId,
          emailStatusActionRecipient: EmailStatusActionRecipients.FAP_REVIEWERS,
          proposalPks,
        }),
        successfulMessage,
        failMessage,
        emailTemplateId,
        loggedInUserId
      );

      break;
    }

    case EmailStatusActionRecipients.FAP_CHAIR_AND_SECRETARY: {
      const FCSs = await getFapChairSecretariesAndFormatOutputForEmailSending(
        proposals,
        recipientWithTemplate
      );

      await sendMail(
        FCSs,
        statusActionLogger({
          connectionId: statusAction.connectionId,
          actionId: statusAction.actionId,
          statusActionsLogId,
          emailStatusActionRecipient:
            EmailStatusActionRecipients.FAP_CHAIR_AND_SECRETARY,
          proposalPks,
        }),
        successfulMessage,
        failMessage,
        emailTemplateId,
        loggedInUserId
      );

      break;
    }

    case EmailStatusActionRecipients.USER_OFFICE: {
      const adminDataSource = container.resolve<AdminDataSource>(
        Tokens.AdminDataSource
      );

      const instrumentDataSource = container.resolve<InstrumentDataSource>(
        Tokens.InstrumentDataSource
      );

      const userOfficeEmail = (
        await adminDataSource.getSetting(SettingsId.USER_OFFICE_EMAIL)
      )?.settingsValue;

      if (!userOfficeEmail) {
        logger.logError(
          'Could not send email(s) to the User Office as the setting (USER_OFFICE_EMAIL) is not set.',
          { proposalEmailsSkipped: proposals }
        );

        break;
      }

      let uoRecipient: EmailReadyType[];

      if (recipientWithTemplate.combineEmails) {
        uoRecipient = [
          {
            id: recipientWithTemplate.recipient.name,
            email: userOfficeEmail,
            proposals: proposals,
            template: recipientWithTemplate.emailTemplate.id,
          },
        ];
      } else {
        const usersDataSource: UserDataSource = container.resolve(
          Tokens.UserDataSource
        );

        const recipientPromises = proposals.map(async (proposal) => ({
          id: recipientWithTemplate.recipient.name,
          email: userOfficeEmail,
          proposals: [proposal],
          template: recipientWithTemplate.emailTemplate.id,
          instruments: await instrumentDataSource.getInstrumentsByProposalPk(
            proposal.primaryKey
          ),
          pi:
            (await usersDataSource.getBasicUserInfo(proposal.proposerId)) ||
            null,
          coProposers:
            (await usersDataSource.getProposalUsers(proposal.primaryKey)) ||
            null,
        }));

        uoRecipient = await Promise.all(recipientPromises);
      }

      await sendMail(
        uoRecipient,
        statusActionLogger({
          connectionId: statusAction.connectionId,
          actionId: statusAction.actionId,
          statusActionsLogId,
          emailStatusActionRecipient: EmailStatusActionRecipients.USER_OFFICE,
          proposalPks,
        }),
        successfulMessage,
        failMessage,
        emailTemplateId,
        loggedInUserId
      );

      break;
    }

    case EmailStatusActionRecipients.TECHNIQUE_SCIENTISTS: {
      const techniqueScientists =
        await getTechniqueScientistsAndFormatOutputForEmailSending(
          proposals,
          recipientWithTemplate
        );
      await sendMail(
        techniqueScientists,
        statusActionLogger({
          connectionId: statusAction.connectionId,
          actionId: statusAction.actionId,
          statusActionsLogId,
          emailStatusActionRecipient:
            EmailStatusActionRecipients.TECHNIQUE_SCIENTISTS,
          proposalPks,
        }),
        successfulMessage,
        failMessage,
        emailTemplateId,
        loggedInUserId
      );

      break;
    }

    case EmailStatusActionRecipients.OTHER: {
      if (!recipientWithTemplate.otherRecipientEmails?.length) {
        logger.logError(
          `Could not execute status action email because no ${EmailStatusActionRecipients.OTHER} recipience set on proposals`,
          { ...proposalPks }
        );
        break;
      }

      for (const email of recipientWithTemplate.otherRecipientEmails) {
        const oRecipients = await getOtherAndFormatOutputForEmailSending(
          proposals,
          recipientWithTemplate,
          email
        );
        await sendMail(
          oRecipients,
          statusActionLogger({
            connectionId: statusAction.connectionId,
            actionId: statusAction.actionId,
            statusActionsLogId,
            emailStatusActionRecipient: EmailStatusActionRecipients.OTHER,
            proposalPks,
          }),
          successfulMessage,
          failMessage,
          emailTemplateId,
          loggedInUserId
        );
      }
      break;
    }

    default:
      break;
  }
};

const sendMail = async (
  recipientsWithData: EmailReadyType[],
  statusActionLogger: (
    actionSuccessful: boolean,
    message: string
  ) => Promise<void>,
  successfulMessage: string,
  failMessage: string,
  emailTemplateId: string,
  loggedInUserId?: number | null
) => {
  const mailService = container.resolve<MailService>(Tokens.MailService);
  const loggingHandler = container.resolve<
    (event: ApplicationEvent) => Promise<void>
  >(Tokens.LoggingHandler);
  const emailEventHandler = container.resolve<
    (event: ApplicationEvent) => Promise<void>
  >(Tokens.EmailEventHandler);
  if (!recipientsWithData.length) {
    logger.logInfo('Could not send email(s) because there are no recipients.', {
      recipientsWithData,
    });

    return;
  }

  try {
    const additionalEmailSubstitutionData =
      recipientsWithData.length > 1
        ? await getAndFormatAdditionalEmailSubstitutionData(
            recipientsWithData[0]
          )
        : {};

    const mailServiceResponse = await Promise.all(
      recipientsWithData.map(async (recipientWithData) => {
        try {
          const res = await mailService.sendMail({
            content: {
              template: emailTemplateId,
            },
            substitution_data: {
              proposals: recipientWithData.proposals,
              pi: recipientWithData.pi,
              coProposers: recipientWithData.coProposers,
              instruments: recipientWithData.instruments,
              firstName: recipientWithData.firstName,
              lastName: recipientWithData.lastName,
              preferredName: recipientWithData.preferredName,
              techniques: recipientWithData.techniques,
              proposalTemplate: recipientWithData.proposalTemplate,
              samples: recipientWithData.samples,
              hazards: recipientWithData.hazards,
              ...additionalEmailSubstitutionData,
            },
            recipients: [{ address: recipientWithData.email }],
          });
          logger.logInfo('Email sent:', {
            result: res,
          });

          for (const proposal of recipientWithData.proposals) {
            const evt = constructProposalStatusChangeEvent(
              proposal,
              loggedInUserId || null,
              `${successfulMessage} template: ${emailTemplateId} to: ${recipientWithData.email} recipient: ${recipientWithData.id}`,
              undefined
            );
            emailEventHandler(evt);
            loggingHandler(evt);
          }

          return res;
        } catch (err) {
          logger.logError('Could not send email', {
            error: err,
          });

          for (const proposal of recipientWithData.proposals) {
            const evt = constructProposalStatusChangeEvent(
              proposal,
              loggedInUserId || null,
              `${failMessage} template: ${emailTemplateId} to: ${recipientWithData.email} recipient: ${recipientWithData.id}`,
              undefined
            );
            emailEventHandler(evt);
            loggingHandler(evt);
          }
          throw err;
        }
      })
    );
    if (
      !!mailServiceResponse.length &&
      !mailServiceResponse.some(
        (result) => result.results.total_rejected_recipients !== 0
      )
    ) {
      await statusActionLogger(true, successfulMessage);

      return;
    }
    await statusActionLogger(false, failMessage);
  } catch (err) {
    logger.logInfo('Status action email(s) not sent:', {
      err,
    });
    await statusActionLogger(false, failMessage);
  }
};

async function getAndFormatAdditionalEmailSubstitutionData(
  recipientWithData: EmailReadyType
): Promise<Record<string, unknown>> {
  const proposal = recipientWithData.proposals[0];
  if (!proposal) {
    return {};
  }

  const callDataSource = container.resolve<CallDataSource>(
    Tokens.CallDataSource
  );
  const fapDataSource = container.resolve<FapDataSource>(Tokens.FapDataSource);
  const instrumentDataSource = container.resolve<InstrumentDataSource>(
    Tokens.InstrumentDataSource
  );
  const reviewDataSource = container.resolve<ReviewDataSource>(
    Tokens.ReviewDataSource
  );

  const [
    call,
    requestedInstruments,
    fapProposals,
    fapMeetingDecisions,
    technicalReviews,
  ] = await Promise.all([
    callDataSource.getCall(proposal.callId),
    instrumentDataSource.getInstrumentsByProposalPk(proposal.primaryKey),
    fapDataSource.getFapsByProposalPks([proposal.primaryKey]),
    fapDataSource.getProposalsFapMeetingDecisions([proposal.primaryKey]),
    reviewDataSource.getTechnicalReviews(proposal.primaryKey),
  ]);

  const instrumentIds = Array.from(
    new Set([
      ...fapProposals
        .map(({ instrumentId }) => instrumentId)
        .filter(
          (instrumentId): instrumentId is number => instrumentId !== null
        ),
      ...(technicalReviews ?? []).map(({ instrumentId }) => instrumentId),
    ])
  );
  const instruments = instrumentIds.length
    ? await instrumentDataSource.getInstrumentsByIds(instrumentIds)
    : requestedInstruments;

  const technicalAssessments = (technicalReviews ?? []).flatMap(
    (technicalReview: TechnicalReview) => {
      const instrument = instruments.find(
        ({ id }) => id === technicalReview.instrumentId
      );
      if (!instrument) {
        return [];
      }

      return [
        {
          facility: {
            name: instrument.name,
            description: instrument.description,
          },
          feasibility: technicalReview.status,
          assessorsComment: stripHtml(technicalReview.publicComment ?? ''),
        },
      ];
    }
  );

  const awardedShifts = instrumentIds.flatMap((instrumentId) => {
    const numberOfShifts =
      fapProposals.find((fap) => fap.instrumentId === instrumentId)
        ?.fapTimeAllocation ??
      technicalReviews?.find((review) => review.instrumentId === instrumentId)
        ?.timeAllocation;
    const instrument = instruments.find(({ id }) => id === instrumentId);

    return typeof numberOfShifts === 'number' && instrument
      ? [{ numberOfShifts, facility: instrument.name }]
      : [];
  });

  return {
    awardedShifts,
    commentsToUser: stripHtml(
      fapMeetingDecisions.find(({ commentForUser }) => commentForUser)
        ?.commentForUser ?? ''
    ),
    technicalAssessments,
    call,
    requestedFacilities: requestedInstruments.map(
      ({ name, description }: Instrument) => ({ name, description })
    ),
  };
}
