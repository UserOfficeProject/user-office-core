import { logger } from '@user-office-software/duo-logger';
import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { CallDataSource } from '../../datasources/CallDataSource';
import { FapDataSource } from '../../datasources/FapDataSource';
import { InviteDataSource } from '../../datasources/InviteDataSource';
import { ProposalDataSource } from '../../datasources/ProposalDataSource';
import { RedeemCodesDataSource } from '../../datasources/RedeemCodesDataSource';
import { RoleClaimDataSource } from '../../datasources/RoleClaimDataSource';
import { UserDataSource } from '../../datasources/UserDataSource';
import { VisitDataSource } from '../../datasources/VisitDataSource';
import { ApplicationEvent } from '../../events/applicationEvents';
import { Event } from '../../events/event.enum';
import { ProposalEndStatus } from '../../models/Proposal';
import { UserRole } from '../../models/User';
import EmailSettings from '../MailService/EmailSettings';
import { MailService } from '../MailService/MailService';

export async function essEmailHandler(event: ApplicationEvent) {
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

  const redeemCodesDataSource = container.resolve<RedeemCodesDataSource>(
    Tokens.RedeemCodesDataSource
  );
  const callDataSource = container.resolve<CallDataSource>(
    Tokens.CallDataSource
  );
  const visitDataSource = container.resolve<VisitDataSource>(
    Tokens.VisitDataSource
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
        logger.logError('Failed email invite. No inviter found', {
          user,
          inviter,
          event,
        });

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
            inviterOrg: inviter.institution,
            redeemCode: redeemCode[0].code,
          },
          recipients: [{ address: user.email }],
        })
        .then((res) => {
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
          logger.logError('Failed email invite', { inviter, event });

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
          logger.logInfo('Email sent on Fap reviewer notify:', {
            result: res,
            event,
          });
        })
        .catch((err: string) => {
          logger.logError('Could not send email on Fap reviewer notify:', {
            error: err,
            event,
          });
        });

      return;
    }
    case Event.VISIT_REGISTRATION_APPROVED: {
      const visitRegistration = await visitDataSource.getRegistration(
        event.visitregistration.userId,
        event.visitregistration.visitId
      );
      if (!visitRegistration) {
        return;
      }

      const user = await userDataSource.getUser(visitRegistration.userId);
      if (!user) {
        return;
      }

      const visit = await visitDataSource.getVisit(
        event.visitregistration.visitId
      );
      if (!visit) {
        return;
      }

      const proposal = await proposalDataSource.get(visit.proposalPk);
      if (!proposal) {
        return;
      }

      const call = await callDataSource.getCall(proposal.callId);
      if (!call) {
        return;
      }

      mailService
        .sendMail({
          content: {
            template_id: 'visit-registration-approved',
          },
          substitution_data: {
            preferredname: user.preferredname,
            startsAt: visitRegistration.startsAt,
            endsAt: visitRegistration.endsAt,
            proposalTitle: proposal.title,
            callShortCode: call.shortCode,
          },
          recipients: [
            { address: user.email },
            {
              address: {
                email: 'useroffice@esss.se',
                header_to: user.email,
              },
            },
          ],
        })
        .then((res) => {
          logger.logInfo('Email sent on visit registration approval', {
            result: res,
            event,
          });
        })
        .catch((err: string) => {
          logger.logError(
            'Could not send email on visit registration approval',
            {
              error: err,
              event,
            }
          );
        });

      return;
    }
  }
}

function getTemplateIdForRole(role: UserRole): string {
  switch (role) {
    case UserRole.USER:
      return 'user-office-registration-invitation';
    case UserRole.INTERNAL_REVIEWER:
      return 'user-office-registration-invitation-reviewer';
    default:
      throw new Error('No valid user role set for email invitation');
  }
}
