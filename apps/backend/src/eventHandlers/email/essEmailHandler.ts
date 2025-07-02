import { logger } from '@user-office-software/duo-logger';
import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { CallDataSource } from '../../datasources/CallDataSource';
import { CoProposerClaimDataSource } from '../../datasources/CoProposerClaimDataSource';
import { FapDataSource } from '../../datasources/FapDataSource';
import { InviteDataSource } from '../../datasources/InviteDataSource';
import { ProposalDataSource } from '../../datasources/ProposalDataSource';
import { RoleClaimDataSource } from '../../datasources/RoleClaimDataSource';
import { UserDataSource } from '../../datasources/UserDataSource';
import { VisitDataSource } from '../../datasources/VisitDataSource';
import { ApplicationEvent } from '../../events/applicationEvents';
import { Event } from '../../events/event.enum';
import { Invite } from '../../models/Invite';
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

  const coProposerDataSource = container.resolve<CoProposerClaimDataSource>(
    Tokens.CoProposerClaimDataSource
  );

  const inviteDataSource = container.resolve<InviteDataSource>(
    Tokens.InviteDataSource
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
          logger.logError('No inviter found when trying to send email', {
            inviter,
            event,
          });

          return;
        }

        const templateId = await getTemplateIdForInvite(invite.id);

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
          })
          .finally(() => {
            inviteDataSource.update({
              id: invite.id,
              templateId: templateId,
            });
          });
      }

      return;
    }

    case Event.INVITE_ACCEPTED: {
      const invite: Invite = event.invite;

      const coProposerClaims = await coProposerDataSource.findByInviteId(
        invite.id
      );
      if (!coProposerClaims || coProposerClaims.length === 0) {
        return;
      }

      for (const claim of coProposerClaims) {
        const proposal = await proposalDataSource.get(claim.proposalPk);
        if (!proposal) {
          logger.logError(
            'No proposal found when trying to send invite accepted email',
            {
              claim,
              event,
            }
          );

          return;
        }

        const principalInvestigator = await userDataSource.getUser(
          proposal.proposerId
        );
        if (!principalInvestigator) {
          logger.logError(
            'No principal investigator found when trying to send invite accepted email',
            {
              claim,
              event,
            }
          );

          return;
        }

        const claimer = await userDataSource.getUser(
          invite.claimedByUserId as number
        );
        if (!claimer) {
          logger.logError(
            'No claimer found when trying to send invite accepted email',
            {
              claim,
              event,
            }
          );

          return;
        }

        mailService
          .sendMail({
            content: {
              template_id: 'co-proposer-invite-accepted',
            },
            substitution_data: {
              piPreferredname: principalInvestigator.preferredname,
              piLastname: principalInvestigator.lastname,
              email: invite.email,
              proposalTitle: proposal.title,
              proposalId: proposal.proposalId,
              claimerPreferredname: claimer.preferredname,
              claimerLastname: claimer.lastname,
            },
            recipients: [{ address: principalInvestigator.email }],
          })
          .then(async (res) => {
            logger.logInfo(
              'Successful email transmission for accepting invite',
              { res }
            );
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

      const invites = await inviteDataSource.findCoProposerInvites(
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
          ...invites.map((invite) => {
            return {
              address: {
                email: invite.email,
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
    case Event.VISIT_REGISTRATION_APPROVED:
    case Event.VISIT_REGISTRATION_CANCELLED: {
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

      const templateId =
        event.type === Event.VISIT_REGISTRATION_APPROVED
          ? 'visit-registration-approved'
          : 'visit-registration-cancelled';

      mailService
        .sendMail({
          content: {
            template_id: templateId,
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
          logger.logInfo(
            `Email sent on visit registration event ${event.type}`,
            {
              result: res,
              event,
            }
          );
        })
        .catch((err: string) => {
          logger.logError(
            `Could not send email on visit registration event ${event.type}`,
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

export async function getTemplateIdForInvite(
  inviteId: number
): Promise<string> {
  // Resolve all necessary data sources in one go
  const roleClaimDS = container.resolve<RoleClaimDataSource>(
    Tokens.RoleClaimDataSource
  );
  const coProposerDS = container.resolve<CoProposerClaimDataSource>(
    Tokens.CoProposerClaimDataSource
  );

  // Fetch all claims concurrently
  const [coProposerClaim, roleClaims] = await Promise.all([
    coProposerDS.findByInviteId(inviteId),
    roleClaimDS.findByInviteId(inviteId),
  ]);

  if (coProposerClaim.length > 0) {
    return 'user-office-registration-invitation-co-proposer';
  }

  if (roleClaims.length > 0) {
    const { roleId } = roleClaims[0];
    switch (roleId) {
      case UserRole.INTERNAL_REVIEWER:
        return 'user-office-registration-invitation-reviewer';
      case UserRole.USER:
        return 'user-office-registration-invitation-user';
      default:
        throw new Error(
          `Unsupported role \"${roleId}\" for invite ${inviteId}`
        );
    }
  }

  throw new Error(`No valid claim found for invite ${inviteId}`);
}
