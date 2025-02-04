import { logger } from '@user-office-software/duo-logger';
import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { CallDataSource } from '../../datasources/CallDataSource';
import { FapDataSource } from '../../datasources/FapDataSource';
import { InviteDataSource } from '../../datasources/InviteDataSource';
import { ProposalDataSource } from '../../datasources/ProposalDataSource';
import { RedeemCodesDataSource } from '../../datasources/RedeemCodesDataSource';
import { ReviewDataSource } from '../../datasources/ReviewDataSource';
import { RoleClaimDataSource } from '../../datasources/RoleClaimDataSource';
import { UserDataSource } from '../../datasources/UserDataSource';
import { ApplicationEvent } from '../../events/applicationEvents';
import { Event } from '../../events/event.enum';
import { ProposalEndStatus } from '../../models/Proposal';
import { UserRole } from '../../models/User';
import EmailSettings from '../MailService/EmailSettings';
import { MailService } from '../MailService/MailService';

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

  if (event.isRejection) {
    return;
  }

  switch (event.type) {
    case Event.EMAIL_INVITE_OLD: {
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

      const templateId = getTemplateIdForRole(event.emailinviteresponse.role);

      mailService
        .sendMail({
          content: {
            template_id: templateId,
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

    case Event.EMAIL_INVITE:
    case Event.EMAIL_INVITES: {
      let invites;
      if ('invite' in event) {
        // single invite in response
        invites = [event.invite];
      } else {
        // multiple invites in response
        invites = event.array;
      }

      for (const invite of invites) {
        if (invite.isEmailSent) {
          continue;
        }
        const inviter = await userDataSource.getBasicUserInfo(
          invite.createdByUserId
        );

        if (!inviter) {
          logger.logError('Failed email invite. No inviter found', {
            inviter,
            event,
          });

          return;
        }

        const roleInviteClaim = await roleClaimDataSource.findByInviteId(
          invite.id
        );

        const templateId = getTemplateIdForRole(roleInviteClaim[0].roleId);

        mailService
          .sendMail({
            content: {
              template_id: templateId,
            },
            substitution_data: {
              // firstname: user.preferredname,
              // lastname: user.lastname,
              email: invite.email,
              inviterName: inviter.firstname,
              inviterLastname: inviter.lastname,
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
          template_id: 'proposal-created',
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
        templateId = 'Accepted-Proposal';
      } else if (finalStatus === ProposalEndStatus.REJECTED) {
        templateId = 'Rejected-Proposal';
      } else if (finalStatus === ProposalEndStatus.RESERVED) {
        templateId = 'Reserved-Proposal';
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
            template_id: 'review-reminder',
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

      let templateId = 'internal-review-created';

      if (event.type === Event.INTERNAL_REVIEW_UPDATED) {
        templateId = 'internal-review-updated';
      } else if (event.type === Event.INTERNAL_REVIEW_DELETED) {
        templateId = 'internal-review-deleted';
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

function getTemplateIdForRole(role: UserRole): string {
  switch (role) {
    case UserRole.USER:
      return 'user-office-registration-invitation';
    case UserRole.INTERNAL_REVIEWER:
    case UserRole.SAMPLE_SAFETY_REVIEWER:
      return 'user-office-registration-invitation-reviewer';
    default:
      throw new Error('No valid user role set for email invitation');
  }
}
