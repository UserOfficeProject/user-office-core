import { logger } from '@user-office-software/duo-logger';
import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { CallDataSource } from '../../datasources/CallDataSource';
import { FapDataSource } from '../../datasources/FapDataSource';
import { ProposalDataSource } from '../../datasources/ProposalDataSource';
import { RedeemCodesDataSource } from '../../datasources/RedeemCodesDataSource';
import { UserDataSource } from '../../datasources/UserDataSource';
import { ApplicationEvent, EventStatus } from '../../events/applicationEvents';
import { Event } from '../../events/event.enum';
import { EventCallback } from '../../events/eventBus';
import { ProposalEndStatus } from '../../models/Proposal';
import { UserRole } from '../../models/User';
import EmailSettings from '../MailService/EmailSettings';
import { MailService } from '../MailService/MailService';

export async function essEmailHandler(
  event: ApplicationEvent,
  eventHandlerCallBack: EventCallback
) {
  const mailService = container.resolve<MailService>(Tokens.MailService);
  const proposalDataSource = container.resolve<ProposalDataSource>(
    Tokens.ProposalDataSource
  );
  const fapDataSource = container.resolve<FapDataSource>(Tokens.FapDataSource);
  const userDataSource = container.resolve<UserDataSource>(
    Tokens.UserDataSource
  );
  const redeemCodesDataSource = container.resolve<RedeemCodesDataSource>(
    Tokens.RedeemCodesDataSource
  );
  const callDataSource = container.resolve<CallDataSource>(
    Tokens.CallDataSource
  );

  if (event.isRejection) {
    return;
  }

  switch (event.type) {
    case Event.EMAIL_INVITE: {
      const user = await userDataSource.getUser(
        event.emailinviteresponse.userId
      );
      const inviter = await userDataSource.getBasicUserInfo(
        event.emailinviteresponse.inviterId
      );

      if (!user || !inviter) {
        const errorMessage = 'Failed email invite';
        logger.logError(errorMessage, { user, inviter, event });
        eventHandlerCallBack(EventStatus.FAILED, errorMessage);

        return;
      }

      const redeemCode = await redeemCodesDataSource.getRedeemCodes({
        placeholderUserId: user.id,
      });

      if (!redeemCode[0]?.code) {
        const errorMessage = 'Failed email invite. No redeem code found';
        logger.logError(errorMessage, {
          user,
          inviter,
          event,
        });
        eventHandlerCallBack(EventStatus.FAILED, errorMessage);

        return;
      }

      mailService
        .sendMail({
          content: {
            template_id:
              event.emailinviteresponse.role === UserRole.USER
                ? 'user-office-registration-invitation'
                : 'user-office-registration-invitation-reviewer',
          },
          substitution_data: {
            firstname: user.preferredname,
            lastname: user.lastname,
            email: user.email,
            inviterName: inviter.firstname,
            inviterLastname: inviter.lastname,
            inviterOrg: inviter.institution,
            redeemCode: redeemCode[0].code,
          },
          recipients: [{ address: user.email }],
        })
        .then((res) => {
          const successfulMessage = 'Successful email transmission';
          logger.logInfo(successfulMessage, { res });

          eventHandlerCallBack(EventStatus.SUCCESSFUL, successfulMessage);
        })
        .catch((err: string) => {
          const errorMessage = 'Failed email transmission';
          logger.logException(errorMessage, err);
          eventHandlerCallBack(EventStatus.FAILED, errorMessage);
        });

      return;
    }

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

      const options: EmailSettings = {
        content: {
          template_id: 'proposal-submitted',
        },
        substitution_data: {
          piPreferredname: principalInvestigator.preferredname,
          piLastname: principalInvestigator.lastname,
          proposalNumber: event.proposal.proposalId,
          proposalTitle: event.proposal.title,
          coProposers: participants.map(
            (partipant) => `${partipant.preferredname} ${partipant.lastname} `
          ),
          callShortCode: call?.shortCode,
        },
        recipients: [
          { address: principalInvestigator.email },
          ...participants.map((partipant) => {
            return {
              address: {
                email: partipant.email,
                header_to: principalInvestigator.email,
              },
            };
          }),
        ],
      };

      mailService
        .sendMail(options)
        .then((res) => {
          const successfulMessage = 'Emails sent on proposal submission:';
          logger.logInfo(successfulMessage, {
            result: res,
            event,
          });
          eventHandlerCallBack(EventStatus.SUCCESSFUL, successfulMessage);
        })
        .catch((err: string) => {
          const errorMessage =
            'Could not send email(s) on proposal submission:';
          logger.logError(errorMessage, {
            error: err,
            event,
          });
          eventHandlerCallBack(EventStatus.FAILED, errorMessage);
        });

      return;
    }

    case Event.PROPOSAL_NOTIFIED: {
      const principalInvestigator = await userDataSource.getUser(
        event.proposal.proposerId
      );
      const call = await callDataSource.getCall(event.proposal.callId);
      if (!principalInvestigator) {
        return;
      }
      const { finalStatus } = event.proposal;
      let templateId = '';
      if (finalStatus === ProposalEndStatus.ACCEPTED) {
        templateId = 'Accepted-Proposal';
      } else if (finalStatus === ProposalEndStatus.REJECTED) {
        templateId = 'Rejected-Proposal';
      } else if (finalStatus === ProposalEndStatus.RESERVED) {
        templateId = 'Reserved-Proposal';
      } else {
        const errorMessage = 'Failed email notification';
        logger.logError(errorMessage, { event });

        eventHandlerCallBack(EventStatus.FAILED, errorMessage);

        return;
      }

      mailService
        .sendMail({
          content: {
            template_id: templateId,
          },
          substitution_data: {
            piPreferredname: principalInvestigator.preferredname,
            piLastname: principalInvestigator.lastname,
            proposalNumber: event.proposal.proposalId,
            proposalTitle: event.proposal.title,
            commentForUser: event.proposal.commentForUser,
            callShortCode: call?.shortCode,
          },
          recipients: [
            { address: principalInvestigator.email },
            {
              address: {
                email: 'useroffice@esss.se',
                header_to: principalInvestigator.email,
              },
            },
          ],
        })
        .then((res) => {
          const successfulMessage = 'Email sent on proposal notify:';
          logger.logInfo(successfulMessage, {
            result: res,
            event,
          });
          eventHandlerCallBack(EventStatus.SUCCESSFUL, successfulMessage);
        })
        .catch((err: string) => {
          const errorMessage = 'Could not send email on proposal notify:';
          logger.logError(errorMessage, {
            error: err,
            event,
          });
          eventHandlerCallBack(EventStatus.FAILED, errorMessage);
        });

      return;
    }
    case Event.FAP_REVIEWER_NOTIFIED: {
      const { id: reviewId, userID, proposalPk } = event.fapReview;
      const fapReviewer = await userDataSource.getUser(userID);
      const proposal = await proposalDataSource.get(proposalPk);

      if (!fapReviewer || !proposal) {
        return;
      }

      const call = await callDataSource.getCall(proposal?.callId);

      mailService
        .sendMail({
          content: {
            template_id: 'review-reminder',
          },
          substitution_data: {
            fapReviewerPreferredName: fapReviewer.preferredname,
            fapReviewerLastName: fapReviewer.lastname,
            proposalNumber: proposal.proposalId,
            proposalTitle: proposal.title,
            commentForUser: proposal.commentForUser,
            callShortCode: call?.shortCode,
          },
          recipients: [
            { address: fapReviewer.email },
            {
              address: {
                email: 'useroffice@esss.se',
                header_to: fapReviewer.email,
              },
            },
          ],
        })
        .then(async (res) => {
          await fapDataSource.setFapReviewNotificationEmailSent(
            reviewId,
            userID,
            proposalPk
          );
          const successfulMessage = 'Email sent on Fap reviewer notify:';
          logger.logInfo(successfulMessage, {
            result: res,
            event,
          });
          eventHandlerCallBack(EventStatus.SUCCESSFUL, successfulMessage);
        })
        .catch((err: string) => {
          const errorMessage = 'Could not send email on Fap reviewer notify:';
          logger.logError(errorMessage, {
            error: err,
            event,
          });
          eventHandlerCallBack(EventStatus.FAILED, errorMessage);
        });

      return;
    }
    default: {
      return;
    }
  }
}
