import { logger } from '@user-office-software/duo-logger';
import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { CallDataSource } from '../../datasources/CallDataSource';
import { CoProposerClaimDataSource } from '../../datasources/CoProposerClaimDataSource';
import { FapDataSource } from '../../datasources/FapDataSource';
import { InviteDataSource } from '../../datasources/InviteDataSource';
import { ProposalDataSource } from '../../datasources/ProposalDataSource';
import { UserDataSource } from '../../datasources/UserDataSource';
import { VisitDataSource } from '../../datasources/VisitDataSource';
import { ApplicationEvent } from '../../events/applicationEvents';
import { Event } from '../../events/event.enum';
import { EventBus } from '../../events/eventBus';
import { Invite } from '../../models/Invite';
import { ProposalEndStatus } from '../../models/Proposal';
import { BasicUserDetails } from '../../models/User';
import EmailSettings from '../MailService/EmailSettings';
import { MailService } from '../MailService/MailService';

export enum EmailTemplateId {
  CO_PROPOSER_INVITE_ACCEPTED = 'co-proposer-invite-accepted',
  PROPOSAL_SUBMITTED = 'proposal-submitted',
  ACCEPTED_PROPOSAL = 'Accepted-Proposal',
  REJECTED_PROPOSAL = 'Rejected-Proposal',
  RESERVED_PROPOSAL = 'Reserved-Proposal',
  REVIEW_REMINDER = 'review-reminder',
  VISIT_REGISTRATION_APPROVED = 'visit-registration-approved',
  VISIT_REGISTRATION_CANCELLED = 'visit-registration-cancelled',
  USER_OFFICE_REGISTRATION_INVITATION_CO_PROPOSER = 'user-office-registration-invitation-co-proposer',
  USER_OFFICE_REGISTRATION_INVITATION_VISIT_REGISTRATION = 'user-office-registration-invitation-visit-registration',
  USER_OFFICE_REGISTRATION_INVITATION_REVIEWER = 'user-office-registration-invitation-reviewer',
  USER_OFFICE_REGISTRATION_INVITATION_USER = 'user-office-registration-invitation-user',
}

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
  const eventBus = container.resolve<EventBus<ApplicationEvent>>(
    Tokens.EventBus
  );

  if (event.isRejection) {
    return;
  }

  switch (event.type) {
    case Event.PROPOSAL_CO_PROPOSER_INVITE_ACCEPTED: {
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
              template_id: EmailTemplateId.CO_PROPOSER_INVITE_ACCEPTED,
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

      const participants = await userDataSource.getProposalUsers(
        event.proposal.primaryKey
      );

      const call = await callDataSource.getCall(event.proposal.callId);

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

        await sendInviteEmail(
          invite,
          inviter,
          EmailTemplateId.USER_OFFICE_REGISTRATION_INVITATION_VISIT_REGISTRATION
        ).then(async () => {
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

        await sendInviteEmail(
          invite,
          inviter,
          EmailTemplateId.USER_OFFICE_REGISTRATION_INVITATION_CO_PROPOSER
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
            template_id: EmailTemplateId.REVIEW_REMINDER,
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
          ? EmailTemplateId.VISIT_REGISTRATION_APPROVED
          : EmailTemplateId.VISIT_REGISTRATION_CANCELLED;

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

async function sendInviteEmail(
  invite: Invite,
  inviter: BasicUserDetails,
  templateId: EmailTemplateId
) {
  const mailService = container.resolve<MailService>(Tokens.MailService);
  const inviteDataSource = container.resolve<InviteDataSource>(
    Tokens.InviteDataSource
  );

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
        templateId: templateId,
      });
      logger.logInfo('Successful email transmission', { res });
    })
    .catch((err: string) => {
      logger.logException('Failed email transmission', err);
    });
}
