import { ApplicationEvent } from "../events/applicationEvents";
import { UserDataSource } from "../datasources/UserDataSource";

export default function createHandler(userDataSource: UserDataSource) {
  // Handler to send email to proposers in accepted proposal
  
  return async function emailHandler(event: ApplicationEvent) {
    function sendEmail(_address: string, _topic: string, _message: string) {}

    switch (event.type) {
      case "PROPOSAL_ACCEPTED": {
        const proposal = event.proposal;
        const participants = await userDataSource.getProposalUsers(proposal.id);

        for (const { firstname, lastname, email } of participants) {
          const topic = "Congrats!";
          const message = `Dear ${firstname} ${lastname}, your proposal has been accepted.`;
          sendEmail(email, topic, message);
        }

        return;
      }

      case "PROPOSAL_REJECTED": {
        const proposal = event.proposal;
        const participants = await userDataSource.getProposalUsers(proposal.id);

        for (const { firstname, lastname, email } of participants) {
          const topic = "Tough luck!";
          const message = `Sorry ${firstname} ${lastname}, your proposal was rejected because: ${
            event.reason
          }`;
          sendEmail(email, topic, message);
        }

        return;
      }
    }
  };
}
