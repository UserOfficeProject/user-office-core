import { logger } from '@user-office-software/duo-logger';
import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { FapDataSource } from '../../datasources/FapDataSource';
import { ProposalDataSource } from '../../datasources/ProposalDataSource';
import { RedeemCodesDataSource } from '../../datasources/RedeemCodesDataSource';
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
  const redeemCodesDataSource = container.resolve<RedeemCodesDataSource>(
    Tokens.UserDataSource
  );

  if (event.isRejection) {
    return;
  }

  switch (event.type) {
    case Event.USER_PASSWORD_RESET_EMAIL: {
      mailService
        .sendMail({
          content: {
            template_id: 'user-office-account-reset-password',
          },
          substitution_data: {
            title: 'ESS User reset account password',
            buttonText: 'Click to reset',
            link: event.userlinkresponse.link,
          },
          recipients: [{ address: event.userlinkresponse.user.email }],
        })
        .then((res: any) => {
          logger.logInfo('Email send on for password reset:', {
            result: res,
            event,
          });
        })
        .catch((err: string) => {
          logger.logError('Could not send email for password reset', {
            error: err,
            event,
          });
        });

      return;
    }

    case Event.EMAIL_INVITE: {
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
                ? 'user-office-registration-invitation'
                : 'user-office-registration-invitation-reviewer',
          },
          substitution_data: {
            firstname: user.preferredname,
            lastname: user.lastname,
            email: user.email,
            inviterName: inviter.firstname,
            inviterLastname: inviter.lastname,
            //inviterOrg: inviter.organisation,
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

    case Event.USER_CREATED: {
      if (process.env.NODE_ENV === 'development') {
        //await userDataSource.setUserEmailVerified(
        //    event.userlinkresponse.user.id
        //);
        logger.logInfo('Set user as verified without sending email', {
          userId: event.userlinkresponse.user.id,
          event,
        });
      } else {
        mailService
          .sendMail({
            content: {
              template_id: 'user-office-account-verification',
            },
            substitution_data: {
              title: 'ESS User portal verify account',
              buttonText: 'Click to verify',
              link: event.userlinkresponse.link,
            },
            recipients: [{ address: event.userlinkresponse.user.email }],
          })
          .then((res: any) => {
            logger.logInfo('Email sent on user creation:', {
              result: res,
              event,
            });
          })
          .catch((err: string) => {
            logger.logError('Could not send email on user creation:', {
              error: err,
              event,
            });
          });
      }

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
          recipients: [
            { address: principalInvestigator.email },
            /*{
                          address: {
                            email: 'useroffice@esss.se',
                            header_to: principalInvestigator.email,
                          },
                        },*/
          ],
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
      const sepReviewer = await userDataSource.getUser(userID);
      const proposal = await proposalDataSource.get(proposalPk);

      if (!sepReviewer || !proposal) {
        return;
      }

      mailService
        .sendMail({
          content: {
            template_id: 'review-reminder',
          },
          substitution_data: {
            sepReviewerPreferredName: sepReviewer.preferredname,
            sepReviewerLastName: sepReviewer.lastname,
            proposalNumber: proposal.proposalId,
            proposalTitle: proposal.title,
            commentForUser: proposal.commentForUser,
          },
          recipients: [
            { address: sepReviewer.email },
            {
              address: {
                email: 'useroffice@esss.se',
                header_to: sepReviewer.email,
              },
            },
          ],
        })
        .then(async (res: any) => {
          await fapDataSource.setFapReviewNotificationEmailSent(
            reviewId,
            userID,
            proposalPk
          );
          logger.logInfo('Email sent on SEP reviewer notify:', {
            result: res,
            event,
          });
        })
        .catch((err: string) => {
          logger.logError('Could not send email on SEP reviewer notify:', {
            error: err,
            event,
          });
        });

      return;
    }
  }
}
