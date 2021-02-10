/* eslint-disable @typescript-eslint/camelcase */
import { logger } from '@esss-swap/duo-logger';
import * as dotenv from 'dotenv';

import { UserDataSource } from '../datasources/UserDataSource';
import { ApplicationEvent } from '../events/applicationEvents';
import { Event } from '../events/event.enum';
import { ProposalEndStatus } from '../models/Proposal';
import { UserRole } from '../models/User';
import EmailSettings from './MailService/EmailSettings';
import { MailService } from './MailService/MailService';
import { SMTPMailService } from './MailService/SMTPMailService';
import { SparkPostMailService } from './MailService/SparkPostMailService';

const options = {
  endpoint: 'https://api.eu.sparkpost.com:443',
};

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const mailService: MailService =
  process.env.EMAIL_PROTOCOL === 'SMTP'
    ? new SMTPMailService()
    : new SparkPostMailService(options);

const isDevEnv = process.env.NODE_ENV === 'development';

// in dev env don't try to send email
if (isDevEnv) {
  mailService.sendMail = async (...args: any[]): Promise<any> => 'no-op';
}

export default function createHandler(userDataSource: UserDataSource) {
  // Handler to send email to proposers in accepted proposal

  return async function emailHandler(event: ApplicationEvent) {
    // if the original method failed
    // there is no point of sending any email
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
            logger.logInfo('Emai send on for password reset:', {
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
        const user = await userDataSource.get(event.emailinviteresponse.userId);
        const inviter = await userDataSource.getBasicUserInfo(
          event.emailinviteresponse.inviterId
        );

        if (!user || !inviter) {
          logger.logError('Failed email invite', { user, inviter, event });

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
              inviterOrg: inviter.organisation,
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
        const principalInvestigator = await userDataSource.get(
          event.proposal.proposerId
        );
        const participants = await userDataSource.getProposalUsersFull(
          event.proposal.id
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
            proposalNumber: event.proposal.shortCode,
            proposalTitle: event.proposal.title,
            coProposers: participants.map(
              partipant => `${partipant.preferredname} ${partipant.lastname} `
            ),
            call: '',
          },
          recipients: [
            { address: principalInvestigator.email },
            ...participants.map(partipant => {
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
        if (isDevEnv) {
          await userDataSource.setUserEmailVerified(
            event.userlinkresponse.user.id
          );
          console.log('verify user without email in development');
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
        const principalInvestigator = await userDataSource.get(
          event.proposal.proposerId
        );
        if (!principalInvestigator) {
          return;
        }
        const { finalStatus } = event.proposal;
        let template_id = '';
        if (finalStatus === ProposalEndStatus.ACCEPTED) {
          template_id = 'Accepted-Proposal';
        } else if (finalStatus === ProposalEndStatus.REJECTED) {
          template_id = 'Rejected-Proposal';
        } else if (finalStatus === ProposalEndStatus.RESERVED) {
          template_id = 'Reserved-Proposal';
        } else {
          logger.logError('Failed email notification', { event });

          return;
        }

        mailService
          .sendMail({
            content: {
              template_id,
            },
            substitution_data: {
              piPreferredname: principalInvestigator.preferredname,
              piLastname: principalInvestigator.lastname,
              proposalNumber: event.proposal.shortCode,
              proposalTitle: event.proposal.title,
              commentForUser: event.proposal.commentForUser,
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
    }
  };
}
