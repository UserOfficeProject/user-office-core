import { ApplicationEvent } from "../events/applicationEvents";
import { UserDataSource } from "../datasources/UserDataSource";
const SparkPost = require("sparkpost");
const client = new SparkPost("bc16dc4667eea20f0d1ba9c47d067ac97df322c8");

export default function createHandler(userDataSource: UserDataSource) {
  // Handler to send email to proposers in accepted proposal

  return async function emailHandler(event: ApplicationEvent) {
    function sendEmail(_address: string, _topic: string, _message: string) {}

    switch (event.type) {
      case "PROPOSAL_ACCEPTED": {
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

      case "PROPOSAL_REJECTED": {
        const proposal = event.proposal;
        const participants = await userDataSource.getProposalUsers(proposal.id);

        for (const { firstname, lastname } of participants) {
          const email = "dummy@dummy.com";
          const topic = "Tough luck!";
          const message = `Sorry ${firstname} ${lastname}, your proposal was rejected because: ${
            event.reason
          }`;
          sendEmail(email, topic, message);
        }

        return;
      }

      case "PASSWORD_RESET_EMAIL": {
        client.transmissions
          .send({
            options: {
              sandbox: true
            },
            content: {
              from: "testing@sparkpostbox.com",
              subject: "Hello, World!",
              html:
                "<html><body><p>Testing SparkPost - the world's most awesomest email service!</p></body></html>"
            },
            recipients: [{ address: "fredrikbolmsten@esss.se" }]
          })
          .then(data => {
            console.log("Woohoo! You just sent your first mailing!");
            console.log(data);
          })
          .catch(err => {
            console.log("Whoops! Something went wrong");
            console.log(err);
          });
        return;
      }
    }
  };
}
