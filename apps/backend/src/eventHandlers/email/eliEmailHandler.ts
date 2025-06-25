import { logger } from '@user-office-software/duo-logger';
import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { CallDataSource } from '../../datasources/CallDataSource';
import { CoProposerClaimDataSource } from '../../datasources/CoProposerClaimDataSource';
import { FapDataSource } from '../../datasources/FapDataSource';
import { InviteDataSource } from '../../datasources/InviteDataSource';
import { ProposalDataSource } from '../../datasources/ProposalDataSource';
import { RedeemCodesDataSource } from '../../datasources/RedeemCodesDataSource';
import { ReviewDataSource } from '../../datasources/ReviewDataSource';
import { RoleClaimDataSource } from '../../datasources/RoleClaimDataSource';
import { UserDataSource } from '../../datasources/UserDataSource';
import { VisitRegistrationClaimDataSource } from '../../datasources/VisitRegistrationClaimDataSource';
import { ApplicationEvent } from '../../events/applicationEvents';
import { Event } from '../../events/event.enum';
import { EventBus } from '../../events/eventBus';
import { Invite } from '../../models/Invite';
import { ProposalEndStatus } from '../../models/Proposal';
import { BasicUserDetails, UserRole } from '../../models/User';
import EmailSettings from '../MailService/EmailSettings';
import { MailService } from '../MailService/MailService';

export enum EmailTemplateId {
  USER_OFFICE_REGISTRATION_INVITATION = 'user-office-registration-invitation',
  USER_OFFICE_REGISTRATION_INVITATION_REVIEWER = 'user-office-registration-invitation-reviewer',
  PROPOSAL_CREATED = 'proposal-created',
  PROPOSAL_SUBMITTED = 'proposal-submitted',
  ACCEPTED_PROPOSAL = 'Accepted-Proposal',
  REJECTED_PROPOSAL = 'Rejected-Proposal',
  RESERVED_PROPOSAL = 'Reserved-Proposal',
  REVIEW_REMINDER = 'review-reminder',
  INTERNAL_REVIEW_CREATED = 'internal-review-created',
  INTERNAL_REVIEW_UPDATED = 'internal-review-updated',
  INTERNAL_REVIEW_DELETED = 'internal-review-deleted',
  USER_OFFICE_REGISTRATION_INVITATION_CO_PROPOSER = 'user-office-registration-invitation-co-proposer',
  USER_OFFICE_REGISTRATION_INVITATION_VISIT_REGISTRATION = 'user-office-registration-invitation-visit-registration',
  USER_OFFICE_REGISTRATION_INVITATION_USER = 'user-office-registration-invitation-user',
}

export async function eliEmailHandler(event: ApplicationEvent) {
  const mailService = container.resolve<MailService>(Tokens.MailService);
  const proposalDataSource = container.resolve<ProposalDataSource>(
    Tokens.ProposalDataSource
  );
  const fapDataSource = container.resolve<FapDataSource>(Tokens.FapDataSource);
  const userDataSource = container.resolve<UserDataSource>(
    Tokens.UserDataSource
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

      mailService
        .sendMail({
          content: {
            template_id:
              event.emailinviteresponse.role === UserRole.USER
                ? EmailTemplateId.USER_OFFICE_REGISTRATION_INVITATION
                : EmailTemplateId.USER_OFFICE_REGISTRATION_INVITATION_REVIEWER,
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

    case Event.PROPOSAL_CREATED: {
      const principalInvestigator = await userDataSource.getUser(
        event.proposal.proposerId
      );

      const call = await callDataSource.getCall(event.proposal.callId);

      if (!principalInvestigator || !call) {
        return;
      }

      const options: EmailSettings = {
        content: {
          template_id: EmailTemplateId.PROPOSAL_CREATED,
        },
        substitution_data: {
          piPreferredname: principalInvestigator.preferredname,
          piLastname: principalInvestigator.lastname,
          proposalNumber: event.proposal.proposalId,
          proposalTitle: event.proposal.title,
          callShortCode: call.shortCode,
        },
        recipients: [{ address: principalInvestigator.email }],
      };

      mailService
        .sendMail(options)
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

      return;
    }

    case Event.PROPOSAL_SUBMITTED: {
      const principalInvestigator = await userDataSource.getUser(
        event.proposal.proposerId
      );
      const participants = await userDataSource.getProposalUsersFull(
        event.proposal.primaryKey
      );
      if (!principalInvestigator) {
        return;
      }

      const options: EmailSettings = {
        content: {
          template_id: EmailTemplateId.PROPOSAL_SUBMITTED,
        },
        substitution_data: {
          piPreferredname: principalInvestigator.preferredname,
          piLastname: principalInvestigator.lastname,
          proposalNumber: event.proposal.proposalId,
          proposalTitle: event.proposal.title,
          coProposers: participants.map(
            (partipant) => `${partipant.preferredname} ${partipant.lastname} `
          ),
          call: '',
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
    case Event.PROPOSAL_VISIT_REGISTRATION_INVITES_UPDATED: {
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

        await sendInviteEmail(invite, inviter).then(async () => {
          await eventBus.publish({
            ...event,
            type: Event.PROPOSAL_VISIT_REGISTRATION_INVITE_SENT,
            description: 'Visit registration invite sent',
            invite,
          });
        });
      }
      break;
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

        await sendInviteEmail(invite, inviter).then(async () => {
          await eventBus.publish({
            ...event,
            type: Event.PROPOSAL_CO_PROPOSER_INVITE_SENT,
            invite,
          });
        });
      }
      break;
    }
    case Event.FAP_REVIEWER_NOTIFIED: {
      const { id: reviewId, userID, proposalPk } = event.fapReview;
      const fapReviewer = await userDataSource.getUser(userID);
      const proposal = await proposalDataSource.get(proposalPk);

      if (!fapReviewer || !proposal) {
        return;
      }

      mailService
        .sendMail({
          content: {
            template_id: EmailTemplateId.REVIEW_REMINDER,
          },
          substitution_data: {
            fapReviewerPreferredName: fapReviewer.preferredname,
            fapReviewerLastName: fapReviewer.lastname,
            proposalNumber: proposal.proposalId,
            proposalTitle: proposal.title,
            commentForUser: proposal.commentForUser,
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

      mailService
        .sendMail({
          content: {
            template_id: templateId,
          },
          substitution_data: {
            assignedByPreferredName: assignedBy.preferredname,
            assignedByLastname: assignedBy.lastname,
            reviewerPreferredName: reviewer.preferredname,
            reviewerLastname: reviewer.lastname,
            technicalReviewerPreferredName: technicalReviewerPreferredName,
            technicalReviewerLastname: technicalReviewerLastname,
            proposalTitle: proposal.title,
            proposalNumber: proposal.proposalId,
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

export async function getTemplateIdForInvite(
  inviteId: number
): Promise<string> {
  const roleClaimDS = container.resolve<RoleClaimDataSource>(
    Tokens.RoleClaimDataSource
  );
  const coProposerDS = container.resolve<CoProposerClaimDataSource>(
    Tokens.CoProposerClaimDataSource
  );
  const visitRegDS = container.resolve<VisitRegistrationClaimDataSource>(
    Tokens.VisitRegistrationClaimDataSource
  );

  // Fetch all claims concurrently
  const [coProposerClaim, visitRegClaim, roleClaims] = await Promise.all([
    coProposerDS.findByInviteId(inviteId),
    visitRegDS.findByInviteId(inviteId),
    roleClaimDS.findByInviteId(inviteId),
  ]);

  if (coProposerClaim.length > 0) {
    return EmailTemplateId.USER_OFFICE_REGISTRATION_INVITATION_CO_PROPOSER;
  }

  if (visitRegClaim.length > 0) {
    return EmailTemplateId.USER_OFFICE_REGISTRATION_INVITATION_VISIT_REGISTRATION;
  }

  if (roleClaims.length > 0) {
    const { roleId } = roleClaims[0];
    switch (roleId) {
      case UserRole.INTERNAL_REVIEWER:
        return EmailTemplateId.USER_OFFICE_REGISTRATION_INVITATION_REVIEWER;
      case UserRole.USER:
        return EmailTemplateId.USER_OFFICE_REGISTRATION_INVITATION_USER;
      default:
        throw new Error(
          `Unsupported role \"${roleId}\" for invite ${inviteId}`
        );
    }
  }

  throw new Error(`No valid claim found for invite ${inviteId}`);
}

async function sendInviteEmail(invite: Invite, inviter: BasicUserDetails) {
  const mailService = container.resolve<MailService>(Tokens.MailService);
  const inviteDataSource = container.resolve<InviteDataSource>(
    Tokens.InviteDataSource
  );

  const templateId = await getTemplateIdForInvite(invite.id);

  return mailService
    .sendMail({
      content: {
        template_id: templateId,
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
      });
      logger.logInfo('Successful email transmission', { res });
    })
    .catch((err: string) => {
      logger.logException('Failed email transmission', err);
    });
}
