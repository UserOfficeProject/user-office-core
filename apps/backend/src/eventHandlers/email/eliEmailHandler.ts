import { logger } from '@user-office-software/duo-logger';
import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { CallDataSource } from '../../datasources/CallDataSource';
import { EmailTemplateDataSource } from '../../datasources/EmailTemplateDataSource';
import { FapDataSource } from '../../datasources/FapDataSource';
import { InviteDataSource } from '../../datasources/InviteDataSource';
import { ProposalDataSource } from '../../datasources/ProposalDataSource';
import { RedeemCodesDataSource } from '../../datasources/RedeemCodesDataSource';
import { ReviewDataSource } from '../../datasources/ReviewDataSource';
import { RoleClaimDataSource } from '../../datasources/RoleClaimDataSource';
import { UserDataSource } from '../../datasources/UserDataSource';
import { ApplicationEvent } from '../../events/applicationEvents';
import { Event } from '../../events/event.enum';
import { EventBus } from '../../events/eventBus';
import { Invite } from '../../models/Invite';
import { ProposalEndStatus } from '../../models/Proposal';
import { BasicUserDetails, UserRole } from '../../models/User';
import EmailSettings from '../MailService/EmailSettings';
import { MailService } from '../MailService/MailService';
import { EmailTemplateId } from './emailTemplateId';

export async function eliEmailHandler(event: ApplicationEvent) {
  const mailService = container.resolve<MailService>(Tokens.MailService);
  const proposalDataSource = container.resolve<ProposalDataSource>(
    Tokens.ProposalDataSource
  );
  const fapDataSource = container.resolve<FapDataSource>(Tokens.FapDataSource);
  const userDataSource = container.resolve<UserDataSource>(
    Tokens.UserDataSource
  );

  const roleClaimDataSource = container.resolve<RoleClaimDataSource>(
    Tokens.RoleClaimDataSource
  );

  const inviteDataSource = container.resolve<InviteDataSource>(
    Tokens.InviteDataSource
  );

  const callDataSource = container.resolve<CallDataSource>(
    Tokens.CallDataSource
  );

  const redeemCodesDataSource = container.resolve<RedeemCodesDataSource>(
    Tokens.RedeemCodesDataSource
  );

  const technicalReviewDataSource = container.resolve<ReviewDataSource>(
    Tokens.ReviewDataSource
  );
  const eventBus = container.resolve<EventBus<ApplicationEvent>>(
    Tokens.EventBus
  );

  const emailTemplateDataSource = container.resolve<EmailTemplateDataSource>(
    Tokens.EmailTemplateDataSource
  );

  if (event.isRejection) {
    return;
  }

  switch (event.type) {
    case Event.EMAIL_INVITE_LEGACY: {
      const user = await userDataSource.getUser(
        event.emailinviteresponse.userId
      );
      const inviter = await userDataSource.getBasicUserInfo(
        event.emailinviteresponse.inviterId
      );

      if (!user || !inviter) {
        logger.logError('Failed email invite', { user, inviter, event });

        return;
      }

      const redeemCode = await redeemCodesDataSource.getRedeemCodes({
        placeholderUserId: user.id,
      });

      if (!redeemCode[0]?.code) {
        logger.logError('Failed email invite. No redeem code found', {
          user,
          inviter,
          event,
        });

        return;
      }

      const templateId =
        event.emailinviteresponse.role === UserRole.USER
          ? EmailTemplateId.USER_OFFICE_REGISTRATION_INVITATION_USER
          : EmailTemplateId.USER_OFFICE_REGISTRATION_INVITATION_REVIEWER;

      const emailTemplate =
        await emailTemplateDataSource.getEmailTemplateByName(templateId);

      mailService
        .sendMail({
          content: {
            template: emailTemplate?.name || templateId || '',
          },
          substitution_data: {
            firstname: user.preferredname,
            lastname: user.lastname,
            email: user.email,
            inviterName: inviter.firstname,
            inviterLastname: inviter.lastname,
            redeemCode: redeemCode[0].code,
          },
          recipients: [{ address: user.email }],
        })
        .then((res: any) => {
          logger.logInfo('Successful email transmission', { res });
        })
        .catch((err: string) => {
          logger.logException('Failed email transmission', err);
        });

      return;
    }

    case Event.PROPOSAL_CO_PROPOSER_INVITES_UPDATED: {
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

        await sendInviteEmail(
          invite,
          inviter,
          'user-office-registration-invitation'
        ).then(async () => {
          await eventBus.publish({
            ...event,
            type: Event.PROPOSAL_CO_PROPOSER_INVITE_SENT,
            invite,
          });
        });
      }

      break;
    }

    case Event.PROPOSAL_CREATED: {
      const principalInvestigator = await userDataSource.getUser(
        event.proposal.proposerId
      );

      const call = await callDataSource.getCall(event.proposal.callId);

      if (!principalInvestigator || !call) {
        return;
      }

      const templateId = EmailTemplateId.PROPOSAL_CREATED;

      const emailTemplate =
        await emailTemplateDataSource.getEmailTemplateByName(templateId);

      const options: EmailSettings = {
        content: {
          template: emailTemplate?.name || templateId || '',
        },
        substitution_data: {
          preferredName: principalInvestigator.preferredname,
          lastName: principalInvestigator.lastname,
          firstName: principalInvestigator.firstname,
          proposal: event.proposal,
          call: call,
        },
        recipients: [{ address: principalInvestigator.email }],
      };

      mailService
        .sendMail(options)
        .then((res: any) => {
          logger.logInfo('Emails sent on proposal creation:', {
            result: res,
            event,
          });
        })
        .catch((err: string) => {
          logger.logError('Could not send email(s) on proposal creation:', {
            error: err,
            event,
          });
        });

      return;
    }

    case Event.PROPOSAL_NOTIFIED: {
      const principalInvestigator = await userDataSource.getUser(
        event.proposal.proposerId
      );
      if (!principalInvestigator) {
        return;
      }
      const { finalStatus } = event.proposal;
      let templateId = '';
      if (finalStatus === ProposalEndStatus.ACCEPTED) {
        templateId = EmailTemplateId.ACCEPTED_PROPOSAL;
      } else if (finalStatus === ProposalEndStatus.REJECTED) {
        templateId = EmailTemplateId.REJECTED_PROPOSAL;
      } else if (finalStatus === ProposalEndStatus.RESERVED) {
        templateId = EmailTemplateId.RESERVED_PROPOSAL;
      } else {
        logger.logError('Failed email notification', { event });

        return;
      }

      const emailTemplate =
        await emailTemplateDataSource.getEmailTemplateByName(templateId);

      mailService
        .sendMail({
          content: {
            template: emailTemplate?.name || templateId || '',
          },
          substitution_data: {
            preferredName: principalInvestigator.preferredname,
            lastName: principalInvestigator.lastname,
            firstName: principalInvestigator.firstname,
            proposal: event.proposal,
          },
          recipients: [{ address: principalInvestigator.email }],
        })
        .then((res: any) => {
          logger.logInfo('Email sent on proposal notify:', {
            result: res,
            event,
          });
        })
        .catch((err: string) => {
          logger.logError('Could not send email on proposal notify:', {
            error: err,
            event,
          });
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

      const templateId = EmailTemplateId.REVIEW_REMINDER;
      const emailTemplate =
        await emailTemplateDataSource.getEmailTemplateByName(templateId);

      mailService
        .sendMail({
          content: {
            template: emailTemplate?.name || templateId || '',
          },
          substitution_data: {
            preferredName: fapReviewer.preferredname,
            lastName: fapReviewer.lastname,
            proposal: proposal,
          },
          recipients: [{ address: fapReviewer.email }],
        })
        .then(async (res: any) => {
          await fapDataSource.setFapReviewNotificationEmailSent(
            reviewId,
            userID,
            proposalPk
          );
          logger.logInfo('Email sent on FAP reviewer notify:', {
            result: res,
            event,
          });
        })
        .catch((err: string) => {
          logger.logError('Could not send email on FAP reviewer notify:', {
            error: err,
            event,
          });
        });

      return;
    }

    case Event.INTERNAL_REVIEW_CREATED:
    case Event.INTERNAL_REVIEW_UPDATED:
    case Event.INTERNAL_REVIEW_DELETED: {
      const assignedBy = await userDataSource.getUser(
        event.internalreview.assignedBy
      );

      const reviewer = await userDataSource.getUser(
        event.internalreview.reviewerId
      );

      const technicalReview =
        await technicalReviewDataSource.getTechnicalReviewById(
          event.internalreview.technicalReviewId
        );

      if (!assignedBy || !reviewer || !technicalReview) {
        logger.logError('Failed email invite', { event });

        return;
      }

      const proposal = await proposalDataSource.get(technicalReview.proposalPk);

      if (!proposal) {
        logger.logError('Failed email invite', { event });

        return;
      }

      let technicalReviewerPreferredName = undefined;
      let technicalReviewerLastname = '<N/A>';

      if (technicalReview.technicalReviewAssigneeId) {
        const technicalReviewer = await userDataSource.getUser(
          technicalReview.technicalReviewAssigneeId
        );

        if (technicalReviewer) {
          technicalReviewerPreferredName = technicalReviewer.preferredname;
          technicalReviewerLastname = technicalReviewer.lastname;
        }
      }

      let templateId = EmailTemplateId.INTERNAL_REVIEW_CREATED;

      if (event.type === Event.INTERNAL_REVIEW_UPDATED) {
        templateId = EmailTemplateId.INTERNAL_REVIEW_UPDATED;
      } else if (event.type === Event.INTERNAL_REVIEW_DELETED) {
        templateId = EmailTemplateId.INTERNAL_REVIEW_DELETED;
      }

      const emailTemplate =
        await emailTemplateDataSource.getEmailTemplateByName(templateId);

      mailService
        .sendMail({
          content: {
            template: emailTemplate?.name || templateId || '',
          },
          substitution_data: {
            assignedByPreferredName: assignedBy.preferredname,
            assignedByLastname: assignedBy.lastname,
            reviewerPreferredName: reviewer.preferredname,
            reviewerLastname: reviewer.lastname,
            technicalReviewerPreferredName: technicalReviewerPreferredName,
            technicalReviewerLastname: technicalReviewerLastname,
            proposal: proposal,
            reviewTitle: event.internalreview.title,
          },
          recipients: [{ address: reviewer.email }],
        })
        .then((res: any) => {
          logger.logInfo('Email sent on internal review change:', {
            result: res,
            event,
          });
        })
        .catch((err: string) => {
          logger.logError('Could not send email on internal review change:', {
            error: err,
            event,
          });
        });
    }
  }
}

function getTemplateIdForRole(role: UserRole): string {
  switch (role) {
    case UserRole.USER:
      return EmailTemplateId.USER_OFFICE_REGISTRATION_INVITATION_USER;
    case UserRole.INTERNAL_REVIEWER:
      return EmailTemplateId.USER_OFFICE_REGISTRATION_INVITATION_REVIEWER;
    default:
      throw new Error('No valid user role set for email invitation');
  }
}

async function sendInviteEmail(
  invite: Invite,
  inviter: BasicUserDetails,
  templateId: string
) {
  const mailService = container.resolve<MailService>(Tokens.MailService);
  const inviteDataSource = container.resolve<InviteDataSource>(
    Tokens.InviteDataSource
  );
  const emailTemplateDataSource = container.resolve<EmailTemplateDataSource>(
    Tokens.EmailTemplateDataSource
  );

  const emailTemplate =
    await emailTemplateDataSource.getEmailTemplateByName(templateId);

  return mailService
    .sendMail({
      content: {
        template: emailTemplate?.name || templateId || '',
      },
      substitution_data: {
        email: invite.email,
        inviterName: inviter.firstname,
        inviterLastname: inviter.lastname,
        inviterOrg: inviter.institution,
        redeemCode: invite.code,
      },
      recipients: [{ address: invite.email }],
    })
    .then(async (res) => {
      await inviteDataSource.update({
        id: invite.id,
        isEmailSent: true,
        templateId: templateId,
      });
      logger.logInfo('Successful email transmission', { res });
    })
    .catch((err: string) => {
      logger.logException('Failed email transmission', err);
    });
}
