import { ApplicationEvent } from "../events/applicationEvents";
import { Event } from '../events/event.enum';
import { UserDataSource } from "../datasources/UserDataSource";
import { logger } from "../utils/Logger";
import { UserRole } from "../models/User";
import { User } from "../resolvers/types/User";

const SparkPost = require("sparkpost");
const options = {
  endpoint: "https://api.eu.sparkpost.com:443"
};
const client = new SparkPost(process.env.SPARKPOST_TOKEN, options);

export default function createHandler(userDataSource: UserDataSource) {
  // Handler to send email to proposers in accepted proposal

  return async function emailHandler(event: ApplicationEvent) {
    function sendEmail(_address: string, _topic: string, _message: string) {}

    switch (event.type) {
      case Event.PROPOSAL_ACCEPTED: {
        const proposal = event.proposal;
        const participants = await userDataSource.getProposalUsers(proposal.id);

        for (const { firstname, lastname } of participants) {
          const email = "dummy@dummy.com";
          const topic = "Congrats!";
          const message = `Dear ${firstname} ${lastname}, your proposal has been accepted.`;
          sendEmail(email, topic, message);
        }

        return;
      }

      case Event.PROPOSAL_REJECTED: {
        const proposal = event.proposal;
        const participants = await userDataSource.getProposalUsers(proposal.id);

        for (const { firstname, lastname } of participants) {
          const email = "dummy@dummy.com";
          const topic = "Tough luck!";
          const message = `Sorry ${firstname} ${lastname}, your proposal was rejected because: ${event.reason}`;
          sendEmail(email, topic, message);
        }

        return;
      }

      case Event.USER_PASSWORD_RESET_EMAIL: {
        client.transmissions
          .send({
            content: {
              template_id: "user-office-account-reset-password"
            },
            substitution_data: {
              title: "ESS User reset account password",
              buttonText: "Click to reset",
              link: event.link
            },
            recipients: [{ address: event.user.email }]
          })
          .then((res: string) => {
            logger.logInfo("Emai send on for password reset:", {
              result: res,
              event
            });
          })
          .catch((err: string) => {
            logger.logError("Could not send email for password reset", {
              error: err,
              event
            });
          });
        return;
      }

      case Event.EMAIL_INVITE: {
        const user = await userDataSource.get(event.userId);
        const inviter = await userDataSource.getBasicUserInfo(event.inviterId);

        if (!user || !inviter) {
          logger.logError("Failed email invite", { user, inviter, event });
          return;
        }

        client.transmissions
          .send({
            content: {
              template_id:
                event.role === UserRole.USER
                  ? "user-office-registration-invitation"
                  : "user-office-registration-invitation-reviewer"
            },
            substitution_data: {
              firstname: user.preferredname,
              lastname: user.lastname,
              email: user.email,
              inviterName: inviter.firstname,
              inviterLastname: inviter.lastname,
              inviterOrg: inviter.organisation
            },
            recipients: [{ address: user.email }]
          })
          .then((res: string) => {
            logger.logInfo("Successful email transmission", { res });
          })
          .catch((err: string) => {
            logger.logException("Failed email transmission", err);
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
        client.transmissions
          .send({
            content: {
              template_id: "proposal-submitted"
            },
            substitution_data: {
              piPreferredname: principalInvestigator.preferredname,
              piLastname: principalInvestigator.lastname,
              proposalNumber: event.proposal.shortCode,
              proposalTitle: event.proposal.title,
              coProposers: participants.map(
                partipant => `${partipant.preferredname} ${partipant.lastname} `
              ),
              call: ""
            },
            recipients: [
              { address: { email: principalInvestigator.email } },
              ...participants.map(partipant => {
                return {
                  address: {
                    email: partipant.email,
                    header_to: principalInvestigator.email
                  }
                };
              })
            ]
          })
          .then((res: string) => {
            logger.logInfo("Email sent on proposal submission:", {
              result: res,
              event
            });
          })
          .catch((err: string) => {
            logger.logError("Could not send email on proposal submission:", {
              error: err,
              event
            });
          });
        return;
      }

      case Event.USER_CREATED: {
        if (process.env.NODE_ENV === "development") {
          await userDataSource.setUserEmailVerified(event.user.id);
          console.log("verify user without email in development");
        } else {
          client.transmissions
            .send({
              content: {
                template_id: "user-office-account-verification"
              },
              substitution_data: {
                title: "ESS User portal verify account",
                buttonText: "Click to verify",
                link: event.link
              },
              recipients: [{ address: event.user.email }]
            })
            .then((res: string) => {
              logger.logInfo("Email sent on user creation:", {
                result: res,
                event
              });
            })
            .catch((err: string) => {
              logger.logError("Could not send email on user creation:", {
                error: err,
                event
              });
            });
        }
        return;
      }
    }
  };
}
